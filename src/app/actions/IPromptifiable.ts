
/**
 * Provides contract to convert the internal state of an instance of the implementing class
 * into a formatted string that can be populated into a prompt with no or little additional formatting.
 */
export interface IPromptifiable {
  /**
   * Creates a string that can be populated into a prompt as-is.
   *
   * @return formatted string representation of the implementing class that can be inserted into a prompt
   */
  promptify(): string
}