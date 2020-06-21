import {authService} from './utils.js';
import {dataManager} from './data.js';
import {utils} from './utils.js';

export const headerInit = async () => {
    const header =  document.getElementById('header-col');

// Init of arr of objects with links
    const arr = [ 
                {id: 'profile', title: "Profile" }, 
                {id: 'adminLink', title: "Admin", href: './admin.html' },
                {class: 'sign-out', title: "Sign out", label: 'Sign out'},
                {class: 'sign-in', title: "Sign in", label: 'Sign in', href: './signin.html'}
    ];

// Rendering header
    header.innerHTML =
        `<div class="header-wrap">
            <div class="header">
                <div class="welcome">
                    <div>
                        <div>Hi,<span id="name"></span></div>
                        <div class="balance-wrap">You've got <span id="balance-num"></span>points</div>
                    </div>
                </div> 
                <div class="links-col"><div class="log-icon"><a title="Log" href="./index.html"></a></div>` + arr.reduce((html,curr) => html + 
                    `<div${curr.id ? ` id="${curr.id}"` : ''}${curr.class ? ` class="${curr.class}"` : ''}>
                        <a href="${curr?.href || "javascript:"}" title="${curr.title}">${curr?.label || ''}</a>
                    </div>`, '') + `</div></div>`;
                        

    // Init of variables
    const welcomeNode = document.querySelector('.welcome');
    const balanceWrap = document.querySelector('.balance-wrap');
    const profile = document.getElementById('profile');
    const admin = document.getElementById('adminLink');
    const signOutBtn = document.querySelector('.sign-out');
    const signInBtn = document.querySelector('.sign-in');
    const logBtn = document.querySelector('.log-btn');

     //Logic of header status when different users are logged 
    if (await authService.isAuthenticated()) {
        signInBtn.style.display="none";
        welcomeNode.style.display = "flex";
        signOutBtn.style.display = "block";
        let dataSS = await authService.getAuthUser();

        if (await authService.isAdmin()) {
            if (logBtn) {
                logBtn.style.display = "block";
            }

            admin.style.display = "block";
            balanceWrap.style.display = "none";
            utils.showWelcome(dataSS.name.toLowerCase());
        } else {
            profile.style.display = "block";
            utils.showWelcome(utils.getNameFirstLetterUpp(dataSS.name), await dataManager.service.findBalanceForKid(dataSS.id));
            profile.querySelector('a').setAttribute('href', `./child-profile.html?id=${dataSS.id}`);
        }
    
    }
    // Sign out logic
    document.querySelector('.sign-out a').addEventListener('click', async () => {
        await authService.signOutUser();
        location.reload();
    }); 

    // Slide in/out effect of header
    document.addEventListener('scroll', () => {
        const bodyEl = document.querySelector('body');
        const heightVal = header.offsetHeight;
        if (window.pageYOffset > heightVal) {
            bodyEl.classList.add('slide');
            setTimeout(() => {header.style.top = '0';})
        } else {
            bodyEl.classList.remove('slide');
            header.style.transition = ''; 
            header.style.top = '';
        }
    });
}
