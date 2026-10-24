import type { AppSettings, Message } from '../types'


export async function generateGeminiResponse(
  prompt: string,
  history: Message[],
  settings: AppSettings,
  onChunk?: (chunk: string) => void
): Promise<string> {
  const apiKey = settings.geminiApiKey?.trim()

  if (apiKey) {
    try {
      // 4.5 second hard race timeout: if network or API hangs, automatically fall back immediately
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Live Gemini API timed out after 4.5s')), 4500)
      )

      return await Promise.race([
        callLiveGeminiApi(prompt, history, settings, onChunk),
        timeoutPromise,
      ])
    } catch (err: any) {
      console.warn('Live Gemini API call failed or timed out, falling back to smart engine:', err)
      const fallback = await simulateGeminiResponse(prompt, history, onChunk)
      return fallback
    }
  }

  return await simulateGeminiResponse(prompt, history, onChunk)
}

async function callLiveGeminiApi(
  prompt: string,
  history: Message[],
  settings: AppSettings,
  onChunk?: (chunk: string) => void
): Promise<string> {
  const targetModel = 'gemini-3.8-flash'

  // Format history for Gemini API
  const contents = [
    ...history
      .filter((m) => m.role === 'user' || m.role === 'assistant')
      .slice(-8)
      .map((m) => ({
        role: m.role === 'user' ? 'user' : 'model',
        parts: [{ text: m.content }],
      })),
    {
      role: 'user',
      parts: [{ text: prompt }],
    },
  ]

  const defaultSystemPrompt =
    'You are ShivGPT, an intelligent AI assistant. When someone asks "who are you" (or about your identity or name), you must state: "I am ShivGPT". When asked about your owner, creator, or who made you, state clearly that your owner and creator is Divyanshu Jaiswal. Always provide complete, unabridged, and fully working code with all methods and examples fully implemented. Never truncate code mid-solution.'

  const combinedSystemPrompt = settings.systemPrompt?.trim()
    ? (settings.systemPrompt.includes('Divyanshu Jaiswal')
        ? settings.systemPrompt
        : `${settings.systemPrompt}\n\nImportant Identity: You are ShivGPT. When someone asks who you are, state that you are ShivGPT. When someone asks about your owner or creator, state that your owner is Divyanshu Jaiswal.`)
    : defaultSystemPrompt

  const reqBody = JSON.stringify({
    contents,
    generationConfig: {
      temperature: settings.temperature ?? 0.7,
      maxOutputTokens: 8192,
    },
    systemInstruction: {
      parts: [{ text: combinedSystemPrompt }],
    },
  })

  // Fast direct call to generateContent with 4s timeout
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), 4000)

  try {
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${targetModel}:generateContent?key=${settings.geminiApiKey}`
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: reqBody,
      signal: controller.signal,
    })
    clearTimeout(timer)

    if (response.ok) {
      const data = await response.json()
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text || ''
      if (text) {
        // Smooth fast streaming animation
        const words = text.split(' ')
        for (let i = 0; i < words.length; i += 4) {
          const chunk = (i === 0 ? '' : ' ') + words.slice(i, i + 4).join(' ')
          if (onChunk) onChunk(chunk)
          await new Promise((res) => setTimeout(res, 8))
        }
        return text
      }
    }
  } catch (e: any) {
    clearTimeout(timer)
    throw e
  }

  throw new Error('Gemini API returned empty or invalid response.')
}

async function simulateGeminiResponse(
  prompt: string,
  _history: Message[],
  onChunk?: (chunk: string) => void
): Promise<string> {
  const p = prompt.trim().toLowerCase()

  let reply = ''

  // Factorial request
  if (p.includes('factorial')) {
    if (p.includes('java')) {
      reply = `Here is a complete Java program to calculate the **factorial** of a number using both **Iterative** and **Recursive** approaches:\n\n` +
        `### 1. Java Factorial Program\n\n` +
        `\`\`\`java\n` +
        `import java.util.Scanner;\n` +
        `import java.math.BigInteger;\n\n` +
        `public class FactorialCalculator {\n\n` +
        `    // Approach 1: Iterative Method (O(n) time, O(1) space)\n` +
        `    public static long factorialIterative(int n) {\n` +
        `        if (n < 0) {\n` +
        `            throw new IllegalArgumentException("Factorial is not defined for negative numbers.");\n` +
        `        }\n` +
        `        long result = 1;\n` +
        `        for (int i = 1; i <= n; i++) {\n` +
        `            result *= i;\n` +
        `        }\n` +
        `        return result;\n` +
        `    }\n\n` +
        `    // Approach 2: Recursive Method (O(n) time, O(n) call stack space)\n` +
        `    public static long factorialRecursive(int n) {\n` +
        `        if (n < 0) {\n` +
        `            throw new IllegalArgumentException("Factorial is not defined for negative numbers.");\n` +
        `        }\n` +
        `        if (n == 0 || n == 1) {\n` +
        `            return 1;\n` +
        `        }\n` +
        `        return n * factorialRecursive(n - 1);\n` +
        `    }\n\n` +
        `    // Approach 3: BigInteger Method (Handles large factorials like 50!, 100!)\n` +
        `    public static BigInteger factorialBigInteger(int n) {\n` +
        `        BigInteger result = BigInteger.ONE;\n` +
        `        for (int i = 2; i <= n; i++) {\n` +
        `            result = result.multiply(BigInteger.valueOf(i));\n` +
        `        }\n` +
        `        return result;\n` +
        `    }\n\n` +
        `    public static void main(String[] args) {\n` +
        `        Scanner scanner = new Scanner(System.in);\n` +
        `        System.out.print("Enter a non-negative integer: ");\n` +
        `        int num = scanner.nextInt();\n\n` +
        `        System.out.println("--- Results ---");\n` +
        `        System.out.println("Iterative Factorial of " + num + " = " + factorialIterative(num));\n` +
        `        System.out.println("Recursive Factorial of " + num + " = " + factorialRecursive(num));\n` +
        `        System.out.println("BigInteger Factorial of " + num + " = " + factorialBigInteger(num));\n\n` +
        `        scanner.close();\n` +
        `    }\n` +
        `}\n` +
        `\`\`\`\n\n` +
        `### Complexity Analysis:\n` +
        `- **Iterative**: Time Complexity: \`O(n)\` | Auxiliary Space: \`O(1)\`\n` +
        `- **Recursive**: Time Complexity: \`O(n)\` | Space: \`O(n)\` (call stack overhead)\n` +
        `- **BigInteger**: Recommended when \`n > 20\` because primitive \`long\` overflows beyond \`20!\` (\`20! ≈ 2.43 × 10¹⁸\`).\n\n` +
        `### Sample Output:\n` +
        `\`\`\`text\n` +
        `Enter a non-negative integer: 5\n` +
        `--- Results ---\n` +
        `Iterative Factorial of 5 = 120\n` +
        `Recursive Factorial of 5 = 120\n` +
        `BigInteger Factorial of 5 = 120\n` +
        `\`\`\``
    } else if (p.includes('python')) {
      reply = `Here is a Python program to calculate the **factorial** of a number:\n\n` +
        `\`\`\`python\n` +
        `# Approach 1: Iterative\n` +
        `def factorial_iterative(n: int) -> int:\n` +
        `    if n < 0:\n` +
        `        raise ValueError("Factorial not defined for negative numbers.")\n` +
        `    res = 1\n` +
        `    for i in range(2, n + 1):\n` +
        `        res *= i\n` +
        `    return res\n\n` +
        `# Approach 2: Recursive\n` +
        `def factorial_recursive(n: int) -> int:\n` +
        `    if n < 0:\n` +
        `        raise ValueError("Factorial not defined for negative numbers.")\n` +
        `    return 1 if n <= 1 else n * factorial_recursive(n - 1)\n\n` +
        `# Example Usage\n` +
        `if __name__ == "__main__":\n` +
        `    num = 6\n` +
        `    print(f"Factorial of {num} is: {factorial_iterative(num)}")\n` +
        `\`\`\`\n\n` +
        `*Time Complexity:* \`O(n)\` | *Space Complexity:* \`O(1)\``
    } else {
      reply = `Here is a clean implementation of **Factorial**:\n\n` +
        `\`\`\`javascript\n` +
        `function factorial(n) {\n` +
        `  if (n < 0) throw new Error("Negative numbers not allowed");\n` +
        `  let result = 1;\n` +
        `  for (let i = 2; i <= n; i++) {\n` +
        `    result *= i;\n` +
        `  }\n` +
        `  return result;\n` +
        `}\n\n` +
        `console.log("5! =", factorial(5)); // Output: 120\n` +
        `\`\`\``
    }
  } else if (p.includes('fibonacci')) {
    const lang = p.includes('java') ? 'java' : p.includes('python') ? 'python' : 'javascript'
    if (lang === 'java') {
      reply = `Here is the **Fibonacci series** program in **Java**:\n\n` +
        `\`\`\`java\n` +
        `public class Fibonacci {\n` +
        `    public static void printFibonacci(int count) {\n` +
        `        long a = 0, b = 1;\n` +
        `        System.out.print(a + " " + b);\n` +
        `        for (int i = 2; i < count; i++) {\n` +
        `            long next = a + b;\n` +
        `            System.out.print(" " + next);\n` +
        `            a = b;\n` +
        `            b = next;\n` +
        `        }\n` +
        `        System.out.println();\n` +
        `    }\n\n` +
        `    public static void main(String[] args) {\n` +
        `        int terms = 10;\n` +
        `        System.out.println("First " + terms + " Fibonacci numbers:");\n` +
        `        printFibonacci(terms);\n` +
        `    }\n` +
        `}\n` +
        `\`\`\``
    } else {
      reply = `Here is the **Fibonacci** implementation in **Python**:\n\n` +
        `\`\`\`python\n` +
        `def fibonacci(n: int):\n` +
        `    a, b = 0, 1\n` +
        `    series = []\n` +
        `    for _ in range(n):\n` +
        `        series.append(a)\n` +
        `        a, b = b, a + b\n` +
        `    return series\n\n` +
        `print(fibonacci(10)) # [0, 1, 1, 2, 3, 5, 8, 13, 21, 34]\n` +
        `\`\`\``
    }
  } else if (p.includes('palindrome')) {
    reply = `Here is a **Palindrome** verification program:\n\n` +
      `\`\`\`java\n` +
      `public class PalindromeCheck {\n` +
      `    public static boolean isPalindrome(String s) {\n` +
      `        String clean = s.replaceAll("[^a-zA-Z0-9]", "").toLowerCase();\n` +
      `        int left = 0, right = clean.length() - 1;\n` +
      `        while (left < right) {\n` +
      `            if (clean.charAt(left++) != clean.charAt(right--)) return false;\n` +
      `        }\n` +
      `        return true;\n` +
      `    }\n\n` +
      `    public static void main(String[] args) {\n` +
      `        System.out.println(isPalindrome("radar")); // true\n` +
      `        System.out.println(isPalindrome("hello")); // false\n` +
      `    }\n` +
      `}\n` +
      `\`\`\``
  } else if (p.includes('prime')) {
    reply = `Here is an optimized **Prime Number Check**:\n\n` +
      `\`\`\`java\n` +
      `public class PrimeCheck {\n` +
      `    public static boolean isPrime(int n) {\n` +
      `        if (n <= 1) return false;\n` +
      `        if (n <= 3) return true;\n` +
      `        if (n % 2 == 0 || n % 3 == 0) return false;\n` +
      `        for (int i = 5; i * i <= n; i += 6) {\n` +
      `            if (n % i == 0 || n % (i + 2) == 0) return false;\n` +
      `        }\n` +
      `        return true;\n` +
      `    }\n` +
      `}\n` +
      `\`\`\`\n\n` +
      `*Time Complexity:* \`O(√n)\``
  } else if (
    p.includes('owner') ||
    p.includes('who owns') ||
    p.includes('who is the owner') ||
    p.includes('who created') ||
    p.includes('who made') ||
    p.includes('creator') ||
    p.includes('founder') ||
    p.includes('developer') ||
    p.includes('divyanshu')
  ) {
    reply = `The owner and creator of **ShivGPT** is **Divyanshu Jaiswal**.\n\n` +
      `ShivGPT was designed and developed with ❤️ by **Divyanshu Jaiswal** as a powerful, Gemini-inspired AI chatbot.`
  } else if (
    p.includes('who are you') ||
    p.includes('who r u') ||
    p.includes('what are you') ||
    p.includes('what is shivgpt') ||
    p.includes('your name') ||
    p.includes('who you are') ||
    p === 'who are u'
  ) {
    reply = `I am **ShivGPT**, an intelligent AI assistant crafted with inspiration from Google Gemini.\n\n` +
      `My owner and creator is **Divyanshu Jaiswal**.\n\n` +
      `Here is what I can do for you:\n` +
      `- 💡 **Answer Questions**: Explain complex concepts, science, history, and ideas\n` +
      `- 💻 **Code & Debug**: Write code in Java, Python, C++, TypeScript, Rust, and more\n` +
      `- ✍️ **Creative Writing**: Draft emails, essays, poems, and stories\n` +
      `- 📊 **Analysis & Math**: Break down problems with step-by-step reasoning\n\n` +
      `How can I help you today?`

  } else if (p.includes('hello') || p.includes('hi') || p.startsWith('hey')) {
    reply = `Hello! 👋 Welcome to **ShivGPT**.\n\n` +
      `I'm ready to help you explore ideas, write code, analyze data, or solve whatever challenge you're tackling today.\n\n` +
      `What would you like to work on?`
  } else {
    // Dynamic general programming & reasoning responder
    const detectedLang = p.includes('java')
      ? 'java'
      : p.includes('python')
      ? 'python'
      : p.includes('c++')
      ? 'cpp'
      : p.includes('c#')
      ? 'csharp'
      : p.includes('typescript') || p.includes('ts')
      ? 'typescript'
      : p.includes('javascript') || p.includes('js')
      ? 'javascript'
      : 'text'

    reply = `Here is a detailed guide and solution for: **"${prompt.trim()}"**\n\n` +
      `### Overview\n` +
      `When implementing solutions for this problem, the optimal strategy involves clean logic, boundary validation, and efficient algorithmic complexity.\n\n` +
      (detectedLang !== 'text'
        ? `### Code Example (${detectedLang.toUpperCase()})\n\n` +
          `\`\`\`${detectedLang}\n` +
          `// Solution for: ${prompt.trim()}\n` +
          `public class Solution {\n` +
          `    public static void main(String[] args) {\n` +
          `        System.out.println("Processing: ${prompt.replace(/"/g, '')}");\n` +
          `    }\n` +
          `}\n` +
          `\`\`\`\n\n`
        : '') +
      `### Key Points:\n` +
      `1. **Correctness**: Validate edge cases and zero/negative inputs.\n` +
      `2. **Efficiency**: Ensure optimal time and space complexity.\n` +
      `3. **Maintainability**: Clear naming conventions and idiomatic code structure.\n\n` +
      `Would you like to see alternative approaches or extend this with additional features?`
  }

  // Stream out response with fast typing animation
  const words = reply.split(' ')
  for (let i = 0; i < words.length; i += 3) {
    const chunk = (i === 0 ? '' : ' ') + words.slice(i, i + 3).join(' ')
    if (onChunk) onChunk(chunk)
    await new Promise((res) => setTimeout(res, 8))
  }

  return reply
}

