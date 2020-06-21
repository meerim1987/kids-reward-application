import {dataManager} from './data.js';

export const utils = {

    // Method returning date details
    getDateDetails (ts){
        const SECONDS_IN_DAY = 60 * 60 * 24;
        const SECONDS_IN_2_DAYS = 60 * 60 * 48;
        const hour = new Intl.DateTimeFormat('en', { hour: 'numeric', hour12: false }).format(ts);
        const minutes = new Intl.DateTimeFormat('en', { minute: 'numeric' }).format(ts);

        let diff = (Math.floor(Date.now() / 1000)) - (ts / 1000);

        if (diff < SECONDS_IN_DAY) {
            return `Today ${hour}:${minutes}`;
        }
        else if (diff < SECONDS_IN_2_DAYS) {
            return `Yesterday ${hour}:${minutes}`;
        }
        else {
            const year = new Intl.DateTimeFormat('en', { year: 'numeric' }).format(ts);
            const month = new Intl.DateTimeFormat('en', { month: 'short' }).format(ts);
            const day = new Intl.DateTimeFormat('en', { day: '2-digit' }).format(ts);
            return `${year} ${month} ${day} ${hour}:${minutes}`;
        }
    },

    // Method returning avatar picture
    getAvatar(id) {
        const arrOfImgLgth = 15;
        return `child-${id%arrOfImgLgth}`;
    },

    // Method returning reward sticker
    getIcon(id) {
        const arrOfIcLgth = 9;
        return `reward-${id%arrOfIcLgth}`;
    },

    // Method getting values of form elements 
    getDataFromInputs(cont){
        let obj = {};
        const inputs = cont.querySelectorAll('.data__field');
        inputs.forEach(el => obj[el.getAttribute('id')] = el.value);
        return obj;
    },

    // Method outlining errors
    outlineError(contNode, className){
        contNode.querySelectorAll('.data__field').forEach(el => el.style.borderBottomColor = 'red');
        contNode.querySelector(`.${className}`).style.display = "block";
        setTimeout(() => contNode.querySelector(`.${className}`).style.opacity = "1", 10);
    },
    // Method removing errors
    removeError(contNode, className){
        contNode.querySelectorAll('.data__field').forEach(el => el.style.borderBottomColor = '#9b9b9b');
        contNode.querySelectorAll(`.${className}`).forEach(el => el.style.opacity = "0");
        setTimeout(() => contNode.querySelectorAll(`.${className}`).forEach(el => el.style.display = "none", 10));
    },
    // Resets input fields
    resetInputFields(context){
        context.querySelectorAll('.data__field').forEach(el => el.classList.contains('quantity') ? el.value = 0 : el.value = '');
    },

    // Fades out
    fadeOut(node){
        node.style.opacity = 0;
        document.querySelector('body').style.overflowY = "auto";
        setTimeout(() => {
            node.style.display = "none";
            node.style.transition = "";
        }, 1000);
    },

    // Fades in
    fadeIn(node){
        node.style.display = "flex";
        document.querySelector('body').style.overflowY = "hidden";
        setTimeout(() => {
            node.style.opacity = 1;
        }, 10);
    },

    // Shows info of logged in user
    showWelcome(name, balance){
        document.getElementById('name').innerHTML = name;
        document.getElementById('balance-num').innerHTML = balance != 'undefined' ? balance : '';
    }, 

    // Makes string uppercase
    getNameFirstLetterUpp(string){
        return string.charAt(0).toUpperCase() + string.slice(1);
    },
    // Shows message
    showMessage(id, className){
       const node = document.getElementById(id).querySelector(`.${className}`);
       node.classList.add('active');
       setTimeout(() => node.classList.remove('active'), 5000);
    }, 

    // Slices the input value
    substrVal(contextNode, id){
        contextNode.addEventListener('keydown', (e) => {
            const inputName = document.getElementById(`${id}`);
            inputName.value = inputName.value.length >= 47 ? inputName.value.substr(0, 47) : inputName.value;
        })
    },
    // Shows feedback message
    showFeedbackMsg(text){
        const msgNode = document.createElement('div');
        msgNode.classList.add('message');
        msgNode.textContent = text;
        const context = document.querySelector('.msg-wrapper-admin');
        context.appendChild(msgNode);
        setTimeout(() => msgNode.style.opacity = "1");
        setTimeout(() => msgNode.style.opacity = "0", 4000)
        setTimeout(() => msgNode.remove(), 6000);
    }
};

// Authorization object
export const authService = {
    getAuthUser: async function() {
        const token = sessionStorage.getItem('token');
        return await dataManager.service.findUserByToken(token);
    },
    isAdmin: async function() {
        const authUser = await this.getAuthUser();
        return authUser && authUser.id === 0;
    },
    isAuthenticated: async function(){
        return (await this.getAuthUser()) !== null;
    },
    signOutUser: async function(){
        sessionStorage.removeItem('token');
    }
}








