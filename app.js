// module pattern

// budget controller
var budgetController = (function(){
    
    function Income(ID, description, value){
        this.ID = ID;
        this.description = description;
        this.value = value;
    }
    
    function Expenses(ID, description, value, percentage){
        this.ID = ID;
        this.description = description;
        this.value = value;
        this.percentage = percentage;
    }
    
    var data = {
        allItems: {
            inc: [],
            exp: []
        },
        totals: {
            inc: 0,
            exp: 0
        },
        budget: 0,
        percentage: -1
    };
    
    function getItemByDescription(description, type){
        var foundIndex = -10;
        data.allItems[type].forEach(function(element, index){
            if(element.description === description)
                foundIndex = index;
        });
        return foundIndex;
    };
    
    function updateTotalPercentage(totalInc, totalExp){
        if (totalInc === 0 || totalExp > totalInc)
            data.percentage = -1;
        else
            data.percentage = Math.round((totalExp / totalInc) * 100);
    };
    
    return {
        addNewItem: function(type, desc, val){       // desc --> description, val --> value
            var ID, newItem, percentage = 0;
                    
            // calculate ID
            if (data.allItems[type].length === 0){
                ID = 0;
            }else {
                ID = data.allItems[type][data.allItems[type].length - 1].ID + 1;
            }
            
            // make a new instance according to type
            if (type === 'inc'){
                newItem = new Income(ID, desc, val);
            }else if (type === 'exp'){
                
                if(data.totals.exp === 0)
                    percentage = -1;
                else 
                    percentage = Math.round((val/data.totals.exp) * 100);
                
                newItem = new Expenses(ID, desc, val, percentage);
            }
            
            // add the new item to the array
            data.allItems[type].push(newItem);
            
            return newItem;
        },
        
        deleteItem: function(element, type){
            var elementIndex, element;
            
            elementIndex = getItemByDescription(element.id, type);
            element = data.allItems[type][elementIndex];
            
            (type === 'exp') ? data.budget += element.value : data.budget -= element.value;
            
            data.totals[type] -= element.value;
            updateTotalPercentage(data.totals.inc, data.totals.exp);
            
            // pop up element
            data.allItems[type].splice(elementIndex, 1);
            console.log(data);
        },
        
        updateBudget: function(type, val){
            /* should be made with a new parameter identify to delete or add item , and just called inside of deleteItem()*/
            var totalExp, totalInc;
/*          totalExp = data.totals.exp;
            totalInc = data.totals.inc;  
            the place of these 2 lines made a problem */
            
            /*console.log(totalExp, totalInc);            // 0, 0*/
            // update totals
            data.totals[type] += val;                   // although we changed one of them
            /*console.log(totalExp, totalInc);            // 0, 0*/
            totalExp = data.totals.exp;
            totalInc = data.totals.inc;
            
            // update budget
            if(type === 'inc')
                data.budget += val;
            else if (type === 'exp')
                data.budget -= val;
            
            // update percentage
            updateTotalPercentage(totalInc, totalExp);
                    
            // update percentages of expenses
            data.allItems.exp.forEach(function(element){
                if(totalExp === 0)
                    element.percentage = -1;
                else 
                    element.percentage = Math.round((element.value/totalExp) * 100);
            });
        },
        
        getExpensesPercentages: function(){
            var percentagesArray = [];
            
            data.allItems.exp.forEach(function(element){
               percentagesArray.push(element.percentage);
            });
            
            return percentagesArray;
        },
        
        getMainPanelData: function(){
            var dataObj = {};
            dataObj.budget = data.budget;
            dataObj.totalIncome = data.totals.inc;
            dataObj.totalExpenses = data.totals.exp;
            dataObj.expensesPercentage = data.percentage;
            
            return dataObj;
        },
        
        getData: function(){
            return (data);
        }
    }
    
})();

// UI controller
var UIcontroller = (function(){
    
    var DOMstrings = {
        date: '.date',
        inputType: '.extra-small-input',
        inputDescription: '.wide-input',
        inputValue: '.small-input',
        inputBtn: '.fa-check-circle',
        incomeList: '#income-list',
        expensesList: '#expenses-list',
        allInputs: '.input',
        expensesPercentages: '.expenses_percentage',
        budget: '.budget',
        totalIncome: '#income-amount',
        totalExpenses: '#expenses-amount',
        expensesPercentage: '#expenses-percentage'
    };
    
    
    return {
        getInput: function(){
            return {
                type: document.querySelector(DOMstrings.inputType).value,            // will be inc or exp
                description: document.querySelector(DOMstrings.inputDescription).value,
                value: parseFloat(document.querySelector(DOMstrings.inputValue).value)
            }
        },
        
        clearInputFields: function(){
            var inputList, inputArray;
            
            // get an input list
            inputList = document.querySelectorAll(DOMstrings.allInputs);
            
            // convert the list into an array
            inputArray = Array.prototype.slice.call(inputList);
            
            // clear all input fields
            inputArray.forEach(function(element, index){
                (index === 0) ? element.value = "inc" : element.value = "";
            })
        },
        
        addListItem: function(newItem, type, updatedData){
            var list, html, expensesPercentage;
            
            // get the right list class according to type
            if (type === 'inc') {
                list = DOMstrings.incomeList;
                html = '<li class="padding" id="' + newItem.description + '">' + newItem.description + '<span class="green-color right-amount">+' + newItem.value + '</span><em class="linear-appear"><i class=" far fa-trash-alt"></i></em></li>';
                
            }else if (type === 'exp'){
                list = DOMstrings.expensesList;
                (newItem.percentage === -1) ? expensesPercentage = 0 : expensesPercentage = newItem.percentage;
                html = '<li class="padding" id="' + newItem.description + '">' + newItem.description + '<span class="red-color right-amount">-' + newItem.value +'</span><span class="red-color right-percentage '+ DOMstrings.expensesPercentages.slice(1,) + ' ">' + expensesPercentage + '%</span><em class="linear-appear appear"><i class=" far fa-trash-alt"></i></em></li>';
            }
            document.querySelector(list).insertAdjacentHTML('beforeend', html);
                      
        },
        
        deleteListItem: function(element){
            element.remove();
        },
        
        updateExpensesPercentages: function (expensesPercentagesArray){
            var percentagesList, percentagesArray;
        
            percentagesList = document.querySelectorAll(DOMstrings.expensesPercentages);
            percentagesArray = Array.prototype.slice.call(percentagesList);
            
            percentagesArray.forEach(function(element, index){
               element.textContent = expensesPercentagesArray[index] + '%';
            });
        },
        
        updateMainPanel: function(mainPanelObj){
            document.querySelector(DOMstrings.budget).textContent = mainPanelObj.budget;
            document.querySelector(DOMstrings.totalIncome).textContent = "+" + mainPanelObj.totalIncome;
            document.querySelector(DOMstrings.totalExpenses).textContent = "-" + mainPanelObj.totalExpenses;
            
            var mainPanelExpensesPercentage = document.querySelector(DOMstrings.expensesPercentage);
            if (mainPanelObj.expensesPercentage === -1 || isNaN(mainPanelObj.expensesPercentage))
                mainPanelExpensesPercentage.textContent = '--';
            else
                mainPanelExpensesPercentage.textContent = mainPanelObj.expensesPercentage + '%';
        },
        
        getDOMstrings: function(){
            return DOMstrings;
        }
    }
})();

// app controller
var controller = (function(budgetCtrl, UIctrl){
    
    var addEventListeners = function(){
        var DOM = UIctrl.getDOMstrings();
        
        /* Add new item events*/
        document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);  
        document.addEventListener('keypress', function(event){
            if(event.keyCode === 13 || event.which === 13){
                ctrlAddItem();
            }
        });
        
        /* Delete item */
        document.addEventListener('click', function(event){
           var element = event.target;
           if(element.tagName.toLowerCase() === 'i' && element.classList.contains("fa-trash-alt")){
               ctrlDeleteItem(element.parentElement.parentElement);           // we send the <li> tag
           }
        });
        
        /* setup date */
        /* Getting correct date */
        var date = new Date();
        document.querySelector(DOM.date).textContent = "Avilable Budget of  " + date.toDateString().slice(4,7) + " " + (date.getYear() +1900 +" :");
    };
    
    var ctrlAddItem = function(){
        var input, inputDescription, inputValue, inputType, newItem;
        
        // 1. get input
        input = UIctrl.getInput();
        
        // 2. check input
        inputDescription = input.description;
        inputType = input.type;
        inputValue = input.value;
        if (inputDescription !== "" && inputValue > 0 && !isNaN(inputValue)){
            // 3. create inc/exp instance
            newItem = budgetCtrl.addNewItem(inputType, inputDescription, inputValue);
            
            // 4. update budget
            budgetCtrl.updateBudget(inputType, inputValue);
            
            // clear input field
            UIctrl.clearInputFields();
            
            // 5. update UI
            updateUI('add', newItem, inputType, budgetCtrl.getExpensesPercentages(), budgetCtrl.getMainPanelData());
        }
    };
    
    var ctrlDeleteItem = function(element){
        var itemType;
        (element.parentElement.id === 'income-list')? itemType = 'inc': itemType = 'exp';
        
        budgetCtrl.deleteItem(element, itemType);                                 // this is the <li> tag element to the button
        updateUI('delete', element, itemType, budgetCtrl.getExpensesPercentages(), budgetCtrl.getMainPanelData());
    }
    
    var updateUI = function(action, item, inputType, expensesPercentages, mainPanelData){
        /*
            Using updatedData makes a flaw in the module pattern you are using because
          now some code in UIcontroller depends on the specific data structure you are
          using inside of the budgetController, the following 2 lines were replaced by
          appropriate replacements( see comment // 5. update UI inside of ctrlAddItem())
          
          UIctrl.updateExpensesPercentages(budgetController.getData());
          UIctrl.updateMainPanel(budgetController.getData());
        */
        
        if(action === 'delete')
            UIctrl.deleteListItem(item);           // item is the parent <li> tag
        else if (action === 'add')
            UIctrl.addListItem(item, inputType);              // item is the made object by Expenses()/ Income() constructors 
        
        UIctrl.updateExpensesPercentages(expensesPercentages);
        UIctrl.updateMainPanel(mainPanelData);
    };
    
    
    return {
       init: function(){
           console.log('App has started!');
           addEventListeners();
       }
    };
    
})(budgetController, UIcontroller);

controller.init();