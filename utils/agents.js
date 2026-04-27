// utils/agents.js — Multi-Agent Orchestration Foundation
const { run } = require("../gemini");
const logger = require("./logger");

/**
 * Orchestrates multiple Gemini calls for complex tasks.
 * Example: Researcher -> Writer -> Reviewer
 */
class AgentCoordinator {
  static async executeComplexTask(prompt) {
    logger.info("Starting multi-agent orchestration", { prompt: prompt.slice(0, 50) });

    try {
      // 1. RESEARCHER AGENT
      logger.info("Step 1: Researcher Agent starting...");
      const researchPrompt = `You are a Research Agent. Analyze the following request and provide key facts, context, and a structured outline of information needed to answer it thoroughly.
      
      REQUEST: ${prompt}`;
      const researchData = await run(researchPrompt);

      // 2. WRITER AGENT
      logger.info("Step 2: Writer Agent starting...");
      const writerPrompt = `You are a Professional Writer Agent. Using the research data provided, write a comprehensive and engaging response to the user's original request.
      
      RESEARCH DATA:
      ${researchData}
      
      ORIGINAL REQUEST: ${prompt}`;
      const draft = await run(writerPrompt);

      // 3. REVIEWER AGENT
      logger.info("Step 3: Reviewer Agent starting...");
      const reviewerPrompt = `You are a Critical Reviewer Agent. Review the following draft for accuracy, clarity, tone, and completeness. If there are any issues, fix them and provide the final polished version.
      
      DRAFT:
      ${draft}
      
      ORIGINAL REQUEST: ${prompt}`;
      const finalResponse = await run(reviewerPrompt);

      logger.info("Multi-agent orchestration complete");
      return {
        response: finalResponse,
        steps: [
          { role: "Researcher", output: researchData },
          { role: "Writer", output: draft },
          { role: "Reviewer", output: finalResponse }
        ]
      };
    } catch (error) {
      logger.error("Multi-agent orchestration failed", { error: error.message });
      throw error;
    }
  }
}

module.exports = AgentCoordinator;
