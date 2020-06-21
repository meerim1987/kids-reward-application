
import {dataManager} from './data.js';
import {utils} from './utils.js';
import {headerInit} from './header.js';

// Authentication in sign in popup
export const generalInit = async ({service }) => {
    const popupNode = document.querySelector('.popup');
    
    popupNode?.querySelector('form')?.addEventListener('click', async function(e){
        e.preventDefault();

        if (!e.target.classList.contains('button')) {
            return;
        }

        const {name, password} = utils.getDataFromInputs(this);

        if (!name || !password) {
            utils.outlineError(popupNode, 'msg-info-2');
            return;
        } 

        let token = await service.loginUser(name, password);

        if (!token) {
            utils.outlineError(popupNode, 'msg-info-1');
            return;
        } 

        sessionStorage.setItem('token', token);
        window.location.href="./index.html";
    });

    await headerInit()
    // Removes all types of error messages
    popupNode.addEventListener('change', function() {utils.removeError(this, 'msg-info')});
};

generalInit(dataManager);

