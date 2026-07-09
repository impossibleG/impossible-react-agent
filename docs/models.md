# Models

The default model client uses the OpenAI-compatible protocol against a local URL. Ollama, llama.cpp, vLLM, LocalAI, and Impossible Inference can be used when their chat endpoint supports tool calling.

Set `MODEL_BASE_URL`, `MODEL_NAME`, and `MODEL_API_KEY` for a different runtime. Local runtimes often accept a placeholder API key; hosted services require a real secret.

The selected model must support tool calling for the complete ReAct loop. Models without tool calling can still answer direct prompts but cannot reliably invoke the configured tools.
