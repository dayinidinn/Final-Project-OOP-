const mealName = document.getElementById('mealName');
const mealDate = document.getElementById('mealDate');
const saveBtn = document.getElementById('saveBtn');
const savedMeals = document.getElementById('savedMeals');
const message = document.getElementById('message');

let mealPlans = [];
let editIndex = -1;

// Load saved meal plans
try {
    const saved = localStorage.getItem('mealPlans');

    if (saved) {
        mealPlans = JSON.parse(saved);
    }

    if (!Array.isArray(mealPlans)) {
        mealPlans = [];
    }
} catch (error) {
    mealPlans = [];
    message.className = 'error-message';
    message.textContent = 'Unable to load saved meal plans.';
}

// Save data to storage
function saveData() {
    try {
        localStorage.setItem('mealPlans', JSON.stringify(mealPlans));
        return true;
    } catch (error) {
        message.className = 'error-message';
        message.textContent = 'Unable to save meal plans.';
        return false;
    }
}

// Display saved meal plans
function displayMeals() {
    savedMeals.innerHTML = '';

    if (mealPlans.length === 0) {
        savedMeals.textContent = 'No meal plans saved yet.';
        return;
    }

    for (let i = 0; i < mealPlans.length; i++) {
        const meal = document.createElement('div');
        meal.className = 'meal-card';

        const name = document.createElement('h3');
        name.textContent = mealPlans[i].name;

        const date = document.createElement('p');
        date.textContent = 'Date: ' + mealPlans[i].date;

        const editBtn = document.createElement('button');
        editBtn.textContent = 'Edit';
        editBtn.className = 'edit-btn';

        editBtn.addEventListener('click', function() {
            editMeal(i);
        });

        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = 'Delete';
        deleteBtn.className = 'delete-btn';

        deleteBtn.addEventListener('click', function() {
            deleteMeal(i);
        });

        meal.append(name, date, editBtn, deleteBtn);
        savedMeals.appendChild(meal);
    }
}

// Create or update a meal plan
saveBtn.addEventListener('click', function() {
    const name = mealName.value.trim();
    const date = mealDate.value;

    if (name === '' || date === '') {
        message.className = 'error-message';
        message.textContent = 'Please fill in all fields.';
        return;
    }

    if (editIndex === -1) {
        mealPlans.push({
            name: name,
            date: date
        });

        if (!saveData()) {
            mealPlans.pop();
            return;
        }

        message.className = 'success-message';
        message.textContent = 'Meal plan saved successfully.';

    } else {
        const oldMeal = mealPlans[editIndex];

        mealPlans[editIndex] = {
            name: name,
            date: date
        };

        if (!saveData()) {
            mealPlans[editIndex] = oldMeal;
            return;
        }

        message.className = 'success-message';
        message.textContent = 'Meal plan updated successfully.';
    }

    editIndex = -1;
    saveBtn.textContent = 'Save Meal Plan';

    mealName.value = '';
    mealDate.value = '';

    displayMeals();
});

// Edit a meal plan
function editMeal(index) {
    mealName.value = mealPlans[index].name;
    mealDate.value = mealPlans[index].date;

    editIndex = index;
    saveBtn.textContent = 'Update Meal Plan';

    message.className = '';
    message.textContent = 'Edit the details and click Update Meal Plan.';
}

// Delete a meal plan
function deleteMeal(index) {
    const confirmDelete = confirm('Delete this meal plan?');

    if (confirmDelete) {
        const removed = mealPlans.splice(index, 1);

        if (!saveData()) {
            mealPlans.splice(index, 0, removed[0]);
            return;
        }

        editIndex = -1;
        mealName.value = '';
        mealDate.value = '';
        saveBtn.textContent = 'Save Meal Plan';

        message.className = 'success-message';
        message.textContent = 'Meal plan deleted successfully.';

        displayMeals();
    }
}

// Show saved records
displayMeals();

// Receive selected recipe name
window.electronAPI.receiveMeal(function(name) {
    if (name) {
        mealName.value = name;
        message.className = '';
        message.textContent = 'Recipe selected: ' + name;
    }
});
