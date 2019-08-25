export default async function sleep<T>(
  delay: number,
  data: T = null
): Promise<T | null> {
  return await new Promise(resolve => setTimeout(() => resolve(data), delay));
}
