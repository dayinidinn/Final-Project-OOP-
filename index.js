const searchBtn = document.getElementById('searchBtn');
const resultDiv = document.getElementById('result');
const mealPlanBtn = document.getElementById('mealPlanBtn');

// Recipe Search
searchBtn.addEventListener('click', async function() {

    const recipe = document.getElementById('recipeInput').value.trim();

    if (recipe === '') {
        alert('Please enter a recipe name.');
        return;
    }

    const url = 'https://www.themealdb.com/api/json/v1/1/search.php?s='
        + encodeURIComponent(recipe);

    resultDiv.textContent = 'Searching recipes...';

    try {
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error('API request failed');
        }

        const data = await response.json();

        resultDiv.innerHTML = '';

        if (!data.meals || data.meals.length === 0) {
            resultDiv.textContent = 'No recipes found.';
            return;
        }

        data.meals.forEach(function(meal) {

            const card = document.createElement('div');
            card.className = 'recipe-card';

            const name = document.createElement('h3');
            name.textContent = meal.strMeal;

            const image = document.createElement('img');
            image.src = meal.strMealThumb;
            image.alt = meal.strMeal;
            image.width = 200;

            const category = document.createElement('p');
            category.textContent = 'Category: ' + meal.strCategory;

            const area = document.createElement('p');
            area.textContent = 'Cuisine: ' + meal.strArea;

            const ingredientTitle = document.createElement('h4');
            ingredientTitle.textContent = 'Ingredients:';

            const ingredientList = document.createElement('ul');

            for (let i = 1; i <= 20; i++) {
                const ingredient = meal['strIngredient' + i];
                const measure = meal['strMeasure' + i];

                if (ingredient && ingredient.trim() !== '') {
                    const item = document.createElement('li');

                    item.textContent = (measure || '').trim()
                        + ' ' + ingredient.trim();

                    ingredientList.appendChild(item);
                }
            }

            const instructions = document.createElement('p');
            instructions.textContent = meal.strInstructions;

            const addBtn = document.createElement('button');
            addBtn.textContent = 'Add to Meal Plan';

            addBtn.addEventListener('click', function() {
                window.electronAPI.openMealWindow(meal.strMeal);
            });

            card.append(name,image,category,area,ingredientTitle,ingredientList,instructions,addBtn);

            resultDiv.appendChild(card);
        });

    } catch (error) {
        resultDiv.textContent = 'Error fetching recipes. Please try again.';
    }
});

// Open Meal Plan Window
mealPlanBtn.addEventListener('click', function() {
    window.electronAPI.openMealWindow();
});


// Recipe Suggestions
const suggestBtn = document.getElementById('suggestBtn');
const suggestion = document.getElementById('suggestion');

suggestBtn.addEventListener('click', async function() {

    const mealTime = document.getElementById('category').value;

    suggestion.className = '';

    if (mealTime === '') {
        suggestion.className = 'error-message';
        suggestion.textContent = 'Please select a meal time.';
        return;
    }

    let categories = [];

    // Choose categories based on meal time
    if (mealTime === 'Breakfast') {
        categories = ['Breakfast', 'Vegetarian', 'Seafood'];
    } else if (mealTime === 'Lunch') {
        categories = ['Chicken', 'Pasta', 'Vegetarian', 'Seafood'];
    } else if (mealTime === 'Dinner') {
        categories = ['Beef', 'Chicken', 'Seafood', 'Vegetarian'];
    } else {
        suggestion.className = 'error-message';
        suggestion.textContent = 'Invalid meal time.';
        return;
    }

    suggestion.textContent = 'Finding recipes...';
    suggestBtn.disabled = true;

    try {
        let allMeals = [];

        // Get recipes from different categories
        for (let i = 0; i < categories.length; i++) {

            const url = 'https://www.themealdb.com/api/json/v1/1/filter.php?c='
                + encodeURIComponent(categories[i]);

            const response = await fetch(url);

            if (!response.ok) {
                throw new Error('API request failed');
            }

            const data = await response.json();

            if (data.meals) {
                for (let j = 0; j < data.meals.length; j++) {

                    const meal = data.meals[j];

                    // Avoid duplicate recipes
                    if (!allMeals.some(function(item) {
                        return item.idMeal === meal.idMeal;
                    })) {
                        allMeals.push(meal);
                    }
                }
            }
        }

        // Display suggestion
        if (allMeals.length === 0) {
            suggestion.className = 'error-message';
            suggestion.textContent =
                'No matching recipe found. Please try another meal time.';
            return;
        }

        const randomIndex = Math.floor(Math.random() * allMeals.length);
        const meal = allMeals[randomIndex];

        suggestion.className = 'success-message';
        suggestion.textContent =
            'Suggested ' + mealTime + ' Recipe: ' + meal.strMeal;

        // Save suggestion
        localStorage.setItem('lastSuggestion', JSON.stringify({
            mealTime: mealTime,
            recipe: meal.strMeal,
            recipeId: meal.idMeal
        }));

    } catch (error) {
        suggestion.className = 'error-message';
        suggestion.textContent = 'Unable to get recipe suggestion.';
    } finally {
        suggestBtn.disabled = false;
    }
});


// Serving Calculator
const calculateBtn = document.getElementById('calculateBtn');

calculateBtn.addEventListener('click', function() {

    const originalInput = document.getElementById('originalServings').value;
    const quantityInput = document.getElementById('quantity').value;
    const newInput = document.getElementById('newServings').value;
    const unit = document.getElementById('unit').value;

    const result = document.getElementById('calculationResult');

    if (originalInput === '' || quantityInput === '' || newInput === '') {
        result.className = 'error-message';
        result.textContent = 'Please fill in all fields.';
        return;
    }

    const original = Number(originalInput);
    const quantity = Number(quantityInput);
    const newServings = Number(newInput);

    if (original <= 0 || quantity <= 0 || newServings <= 0 ||
        !Number.isFinite(original) ||
        !Number.isFinite(quantity) ||
        !Number.isFinite(newServings)) {

        result.className = 'error-message';
        result.textContent = 'Please enter valid numbers greater than zero.';
        return;
    }

    const newQuantity = (quantity / original) * newServings;

    result.className = 'success-message';
    result.textContent = 'You need ' +
        Number(newQuantity.toFixed(2)) + ' ' + unit +
        ' for ' + newServings + ' servings.';
});


// Find Recipes by Ingredient
const ingredientBtn = document.getElementById('ingredientBtn');
const ingredientResult = document.getElementById('ingredientResult');

ingredientBtn.addEventListener('click', async function() {

    const ingredient = document.getElementById('ingredient').value;

    ingredientResult.innerHTML = '';
    ingredientResult.className = '';

    if (ingredient === '') {
        ingredientResult.className = 'error-message';
        ingredientResult.textContent = 'Please select an ingredient.';
        return;
    }

    ingredientResult.textContent = 'Finding recipes...';
    ingredientBtn.disabled = true;

    try {
        // Find recipes using the selected ingredient
        const url = 'https://www.themealdb.com/api/json/v1/1/filter.php?i='
            + encodeURIComponent(ingredient);

        const response = await fetch(url);

        if (!response.ok) {
            throw new Error('Unable to find recipes');
        }

        const data = await response.json();

        if (!data.meals || data.meals.length === 0) {
            ingredientResult.className = 'error-message';
            ingredientResult.textContent = 'No recipes found.';
            return;
        }

        // Choose one random recipe
        const randomIndex = Math.floor(Math.random() * data.meals.length);
        const selectedMeal = data.meals[randomIndex];

        // Get the full recipe details
        const detailUrl = 'https://www.themealdb.com/api/json/v1/1/lookup.php?i='
            + selectedMeal.idMeal;

        const detailResponse = await fetch(detailUrl);

        if (!detailResponse.ok) {
            throw new Error('Unable to get recipe details');
        }

        const detailData = await detailResponse.json();

        if (!detailData.meals || detailData.meals.length === 0) {
            ingredientResult.className = 'error-message';
            ingredientResult.textContent = 'Recipe details not found.';
            return;
        }

        const meal = detailData.meals[0];

        // Recipe card
        const card = document.createElement('div');
        card.className = 'recipe-card';

        // Recipe name
        const name = document.createElement('h3');
        name.textContent = meal.strMeal;

        // Recipe image
        const image = document.createElement('img');
        image.src = meal.strMealThumb;
        image.alt = meal.strMeal;

        // Recipe category
        const category = document.createElement('p');
        category.textContent = 'Category: ' + meal.strCategory;

        // Recipe cuisine
        const area = document.createElement('p');
        area.textContent = 'Cuisine: ' + meal.strArea;

        // Ingredient heading
        const ingredientTitle = document.createElement('h4');
        ingredientTitle.textContent = 'Ingredients:';

        const ingredientList = document.createElement('ul');

        // Display ingredients and measurements
        for (let i = 1; i <= 20; i++) {
            const itemName = meal['strIngredient' + i];
            const measure = meal['strMeasure' + i];

            if (itemName && itemName.trim() !== '') {
                const item = document.createElement('li');

                item.textContent = (measure || '').trim()
                    + ' ' + itemName.trim();

                ingredientList.appendChild(item);
            }
        }

        // Cooking instructions
        const instructionTitle = document.createElement('h4');
        instructionTitle.textContent = 'Cooking Instructions:';

        const instructions = document.createElement('p');
        instructions.textContent = meal.strInstructions || 'No instructions available.';
        instructions.className = 'recipe-instructions';

        // Add to meal plan button
        const addBtn = document.createElement('button');
        addBtn.textContent = 'Add to Meal Plan';

        addBtn.addEventListener('click', function() {
            window.electronAPI.openMealWindow(meal.strMeal);
        });

        // Display recipe information
        card.append(name,image,category,area,ingredientTitle,ingredientList,instructionTitle,instructions,addBtn);

        ingredientResult.innerHTML = '';
        ingredientResult.appendChild(card);

        // Save the suggestion
        localStorage.setItem('ingredientSuggestion', JSON.stringify({
            ingredient: ingredient,
            recipe: meal.strMeal,
            recipeId: meal.idMeal
        }));

    } catch (error) {
        ingredientResult.className = 'error-message';
        ingredientResult.textContent = 'Unable to load recipe. Please try again.';
    } finally {
        ingredientBtn.disabled = false;
    }
});
