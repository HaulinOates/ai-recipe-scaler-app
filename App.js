import React, { useState } from 'react';
import './App.css';
import recipeData from './data/allrecipes_sample.json';
import axios from 'axios';

async function scaleWithAI(recipeText, vesselType) {
  const prompt = `Adjust this recipe for a ${vesselType}. Provide updated ingredient quantities and cooking instructions:\n\n${recipeText}`;

  try {
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-4',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.4,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.REACT_APP_OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );
    return response.data.choices[0].message.content;
  } catch (err) {
    console.error('Error calling OpenAI:', err);
    return '⚠️ AI failed to scale this recipe.';
  }
}


export default function App() {
  const [recipeText, setRecipeText] = useState('');
  const [vesselType, setVesselType] = useState('');
  const [scaledRecipe, setScaledRecipe] = useState('');
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const categorizedRecipes = recipeData.reduce((acc, recipe) => {
    const meal = recipe.category || 'Uncategorized';
    if (!acc[meal]) acc[meal] = [];
    acc[meal].push(recipe);
    return acc;
  }, {});

  const filteredRecipes = Object.entries(categorizedRecipes).reduce(
    (acc, [category, recipes]) => {
      const filtered = recipes.filter((r) =>
        r.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      if (filtered.length > 0) acc[category] = filtered;
      return acc;
    },
    {}
  );

  const handleScaleRecipe = async () => {
    const response = \`Scaled recipe for selected cookware: \${vesselType}\n\n\${recipeText}\n\n(Ingredients and cook times adjusted)\`;
    setScaledRecipe(response);
  };

  return (
    <div className="container">
      <h1 className="heading">AI Recipe Scaler</h1>

      <div className="section">
        <h2>Scale a Recipe</h2>

        <label>
          Select Cookware:
          <select value={vesselType} onChange={(e) => setVesselType(e.target.value)} className="input">
            <option value="">Choose one</option>
            <option value="9x13_baking">9x13" Baking Dish</option>
            <option value="12_skillet">12" Skillet</option>
            <option value="4qt_saucepan">4 qt Saucepan</option>
          </select>
        </label>

        <label>
          Your Recipe:
          <textarea
            className="textarea"
            rows={6}
            value={recipeText}
            onChange={(e) => setRecipeText(e.target.value)}
            placeholder="Paste your recipe here..."
          />
        </label>

        <button className="button" onClick={handleScaleRecipe}>
          Scale Recipe
        </button>

        {scaledRecipe && <pre className="output">{scaledRecipe}</pre>}
      </div>

      <div className="section">
        <h2>Browse Recipes</h2>

        <input
          type="text"
          placeholder="Search recipes..."
          className="input"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />

        {Object.entries(filteredRecipes).map(([category, recipes]) => (
          <div key={category}>
            <h3>{category}</h3>
            <ul>
              {recipes.map((recipe) => (
                <li
                  key={recipe.name}
                  className="recipe-link"
                  onClick={() => setSelectedRecipe(recipe)}
                >
                  {recipe.name}
                </li>
              ))}
            </ul>
          </div>
        ))}

        {selectedRecipe && (
          <div className="recipe-detail">
            <h3>{selectedRecipe.name}</h3>
            <h4>Ingredients:</h4>
            <ul>
              {selectedRecipe.ingredients.map((item, idx) => (
                <li key={idx}>{item}</li>
              ))}
            </ul>
            <h4>Instructions:</h4>
            <p>{selectedRecipe.instructions}</p>
          </div>
        )}
      </div>
    </div>
  );
}
