import { useState } from "react";
import "./styles.css";

const defaultPrompt =
  "You are a marketing specialist.\n" +
  "Your goal is to create one new fantasy-like pizza name.\n" +
  "The pizza name should be creative and based on user input.\n" +
  "The pizza name should not be longer than 3 words.\n" +
  "The pizza names should not include the word PIZZA.\n" +
  "The pizza names should mention a diminutive of one of the user's ingredients";

const API_ENDPOINT = "https://api.openai.com/v1/chat/completions";
const DEFAULT_TEMPERATURE = 0.5;
const DEFAULT_MAX_TOKENS = 256;

const MODELS = ["gpt-3.5-turbo", "gpt-4"];

const KEYWORDS = [
  "unicorn",
  "sunshine",
  "rainbow",
  "puppy",
  "kitten",
  "frog",
  "nirvana",
  "happy",
];
const INGREDIENTS = [
  "mozzarella",
  "sun-dried-tomatoes",
  "prosciutto",
  "artichokes",
  "garlic",
  "pepperoni",
  "mushrooms",
  "ricotta",
  "spinach",
  "gorgonzola",
  "parmesan",
  "arugula",
  "pesto",
  "anchovies",
  "pineapple",
  "ham",
  "eggplant",
  "zucchini",
  "salami",
  "shrimp",
  "clams",
  "feta",
  "red-onions",
  "pancetta",
  "sweet-corn",
  "basil",
  "bell-peppers",
  "olive-oil",
];

export default function App() {
  const [configuration, setConfiguration] = useState({
    apiKey: "",
    apiKeyInput: "",
    temperature: DEFAULT_TEMPERATURE,
    maxTokens: DEFAULT_MAX_TOKENS,
    model: MODELS[0],
  });
  const [generatedName, setGeneratedName] = useState("");
  const [improveSection, setImproveSection] = useState(false);
  const [userFeedback, setUserFeedback] = useState("");
  const [loading, setLoading] = useState(false);

  const [userInput, setUserInput] = useState({
    keyword: KEYWORDS[0],
    ingredients: [],
  });

  const resetForm = () => {
    setConfiguration({
      //apiKey: DEFAULT_API_KEY,
      temperature: DEFAULT_TEMPERATURE,
      maxTokens: DEFAULT_MAX_TOKENS,
      model: MODELS[0],
    });

    setUserInput({
      keyword: KEYWORDS[0],
      ingredients: [],
    });

    setGeneratedName("");
    setImproveSection(false);

    // Reset all selected options
    const ingredients = document.querySelector(".form_ingredients");

    for (let i = 0; i < ingredients.options.length; i++) {
      ingredients.options[i].selected = false;
    }
  };

  const handleIngredientChange = (e) => {
    const ingredients = e.target.options;
    const selectedIngredients = [];

    for (let i = 0; i < ingredients.length; i++) {
      if (ingredients[i].selected) {
        selectedIngredients.push(ingredients[i].value);
      }
    }

    setUserInput({
      ...userInput,
      ingredients: selectedIngredients,
    });
  };

  const generate = async () => {
    try {
      setLoading(true);
      const response = await fetch(API_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${configuration.apiKey}`,
        },
        body: JSON.stringify({
          model: configuration.model,
          max_tokens: configuration.maxTokens,
          temperature: configuration.temperature,
          messages: [...getMessages(), ...getFeedbackMessages()],
          //logprobs: true,
          //t_probs: top 10%,
          //n: How many chat completion choices to generate for each input message.
          //presence_penalty: Number between -2.0 and 2.0. Positive values penalize new tokens based on whether they appear in the text so far, increasing the model's likelihood to talk about new topics.
          //seed: This feature is in Beta. If specified, our system will make a best effort to sample deterministically, such that repeated requests with the same seed and parameters should return the same result. Determinism is not guaranteed, and you should refer to the system_fingerprint response parameter to monitor changes in the backend.
        }),
      });

      const data = await response.json();
      const generatedName = data.choices[0].message.content;

      setGeneratedName(generatedName);
      setImproveSection(true);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const getMessages = () => {
    return [
      {
        role: "system",
        content: defaultPrompt,
      },
      {
        role: "user",
        content: `Generate a pizza name using the keyword: "${userInput.keyword}" and the following ingredients: ${userInput.ingredients}`,
      },
    ];
  };

  const getFeedbackMessages = () => {
    if (!generatedName) {
      return [];
    }

    return userFeedback
      ? [
          {
            role: "user",
            content: `Your previous response was: ${generatedName}. The user has provided the following feedback: ${userFeedback}. Re-generate your response according to the provided feedback.`,
          },
        ]
      : [];
  };

  return (
    <div className="container col-md-10 mx-auto">
      <div className="text-center title">
        <h1>GenAI Playground</h1>
        <h5>Pizza name generation</h5>
      </div>
      <div className="context">
        <h3>Context</h3>
        <p>
          Your name is Giovanni and you own a restaurant called Giovanni's
          Pizza, in the picturesque town of Florence, Italy. You've come up with
          a new pizza recipe and you need to decide how to creatively name it,
          to attract more customers.
        </p>
      </div>

      <form>
        <div className="cards ">
          <div className="row config">
            <h3>Configuration</h3>
            <hr />
            <div className="col-md-10 mx-auto">
              <div className="form-group row">
                <label htmlFor="apiKey">API Key</label>
                <div className="input-group mb-3 ">
                  <input
                    type="password"
                    className="form-control"
                    id="apiKey"
                    placeholder="sk-..."
                    onChange={(e) => {
                      setConfiguration({
                        ...configuration,
                        apiKeyInput: e.target.value,
                      });
                    }}
                  />
                  <div className="input-group-append">
                    <button
                      className="btn btn-outline-secondary btnAuthorize"
                      type="button"
                      onClick={() =>
                        setConfiguration({
                          ...configuration,
                          apiKey: configuration.apiKeyInput,
                        })
                      }
                    >
                      Authorize
                    </button>
                  </div>
                </div>
                <div className="col-sm-6">
                  <label htmlFor="temperature" className="col-form-label">
                    Temperature
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="2"
                    step="0.1"
                    className="form-control"
                    id="temperature"
                    value={configuration.temperature}
                    onChange={(e) => {
                      setConfiguration({
                        ...configuration,
                        temperature: parseFloat(e.target.value),
                      });
                    }}
                  />
                  <small id="temperatureHelp" className="form-text text-muted">
                    Value: 0 - 2
                  </small>
                </div>
                <div className="col-sm-6">
                  <label htmlFor="tokens" className="col-form-label">
                    Max Tokens
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="2048"
                    step="1"
                    className="form-control"
                    id="tokens"
                    value={configuration.maxTokens}
                    onChange={(e) => {
                      setConfiguration({
                        ...configuration,
                        maxTokens: parseInt(e.target.value),
                      });
                    }}
                  />
                  <small id="tokensHelp" className="form-text text-muted">
                    Value: 1 - 2048
                  </small>
                </div>
              </div>
              <div className="form-group row">
                <div className="col-sm-6">
                  <label htmlFor="model" className="form-label">
                    Model
                  </label>
                  <select
                    name="model"
                    id="model"
                    className="form-select"
                    value={configuration.model}
                    onChange={(e) =>
                      setConfiguration({
                        ...configuration,
                        model: e.target.value,
                      })
                    }
                  >
                    {MODELS.map((model) => (
                      <option key={model} value={model}>
                        {model}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-sm-6"></div>
              </div>
            </div>
          </div>
        </div>

        <div className="row config">
          <h3>User input</h3>
          <hr />
          <div className="col-md-10 mx-auto">
            <div className="form-group row">
              <div className="col-sm-6">
                <label htmlFor="keyword" className="form-label">
                  Keyword
                </label>
                <select
                  name="keyword"
                  id="keyword"
                  className="form_keyword form-select"
                  value={userInput.keyword}
                  onChange={(e) => {
                    setUserInput({
                      ...userInput,
                      keyword: e.target.value,
                    });
                  }}
                >
                  {KEYWORDS.map((keyword) => (
                    <option key={keyword} value={keyword}>
                      {keyword.charAt(0).toUpperCase() + keyword.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-sm-6">
                <label htmlFor="ingredients" className="form-label">
                  Ingredients:
                </label>
                <select
                  name="ingredients"
                  className="form_ingredients form-select"
                  size={8}
                  onChange={(e) => {
                    handleIngredientChange(e);
                  }}
                  multiple
                >
                  {INGREDIENTS.map((ingredient) => (
                    <option key={ingredient} value={ingredient}>
                      {ingredient.charAt(0).toUpperCase() + ingredient.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="row config">
          <h3>Result & Feedback</h3>
          <hr />
          <div className="col-md-10 mx-auto">
            <div className="form-group row">
              <div className="col-sm-12">
                <label htmlFor="response" className="form-label">
                  Generated name
                </label>
                <textarea
                  name="response"
                  className="response form-control"
                  id="response"
                  value={generatedName}
                  readOnly
                ></textarea>
                <br />
                {improveSection && (
                  <div className="improveSection">
                    <label htmlFor="improve" className="form-label">
                      Improve
                    </label>
                    <textarea
                      className="form-control"
                      id="userFeedback"
                      value={userFeedback}
                      onChange={(e) => {
                        setUserFeedback(e.target.value);
                      }}
                    ></textarea>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        <div className="d-flex gap-2">
          <button
            type="button"
            className="btn btn-primary d-flex align-items-center justify-content-center"
            style={{ width: "120px" }}
            onClick={generate}
          >
            {loading ? (
              <span
                className="spinner-border spinner-border-sm"
                id="spinner"
                role="status"
              ></span>
            ) : (
              "Generate"
            )}
          </button>
          <button
            type="button"
            className="btn btn-outline-secondary btnRestart"
            onClick={resetForm}
          >
            Restart
          </button>
        </div>
      </form>
    </div>
  );
}
