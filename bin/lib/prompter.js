/**
 * The only module in bin/ that knows about the prompt library.
 * The import is dynamic and happens inside createPrompter(), so
 * non-interactive code paths never load it.
 */

export const CANCELLED = Symbol.for('frontend-agent-skills.cancelled')

export async function createPrompter() {
  const clack = await import('@clack/prompts')
  const unwrap = (value) => (clack.isCancel(value) ? CANCELLED : value)

  return {
    async multiselect({ message, options, initialValues }) {
      return unwrap(await clack.multiselect({ message, options, initialValues, required: true }))
    },
    async select({ message, options, initialValue }) {
      return unwrap(await clack.select({ message, options, initialValue }))
    },
    info(text) {
      clack.log.info(text)
    },
    cancel(text) {
      clack.cancel(text)
    },
  }
}
