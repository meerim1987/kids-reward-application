import {dataManager} from './data.js';
import {utils, authService} from './utils.js';

export const redeem = async(childId) => {
    const {activityModel, rewardModel, service} = dataManager;
    const popup = document.querySelector('.popup');
    const stickersCont = document.querySelector('.stickers-wrap');

    const logEntryCount = await service.findActivityLogCount(childId);
    const user = await authService.getAuthUser();

    // Function which renders icons
    const renderIcons = async() => {
        const rewardsOfChild = await service.getRewards(childId);
        stickersCont.innerHTML = rewardsOfChild.map(log => 
            `<div><span class="sticker-pic" style="background-image:url(./assets/stickers/${utils.getIcon(log.id)}.gif)"></span><span class="reward-title">${log.title}</span></div>`).join('');
    };
    
    // Show his/her redeem btn only when the corresponding child is logged in
    if (user?.id === childId) {
        const node = document.createElement('div');
        node.innerHTML = '<input class="button button-log log-btn redeem-btn" type="submit" value="Redeem">';
        document.getElementById('redeem-btn-wrap').appendChild(node.firstChild);
        renderIcons(); 
    }

    // Function shows balance status in popup
    const renderBalanceInPop = async() => {
        popup.querySelector('.popup-balance span').innerHTML = await service.findBalanceForKid(childId);
    }

    // Show redeem btn only when balance of kid is more than 0
    const redeemBtn = document.querySelector('.redeem-btn');
    if (await service.findBalanceForKid(childId) > 0) {
        if (redeemBtn) {
            redeemBtn.style.display = "block";
        }
    }

    // Function which renders rewards list
    const renderRewardsList = async () => {
        const allRewards = await rewardModel.getAll();
        document.getElementById('redeem-list').innerHTML = allRewards.map(el => `<li data-id="${el.id}">
                                                                                    <div class="reward-cont">
                                                                                        <span class="mini-icon"><img src="../assets/stickers/${utils.getIcon(el.id)}.gif"/></span>
                                                                                        <span class="reward-text">${el.rewards}</span>
                                                                                        <a href="javascript:" class="redeem-link text-muted">Redeem</a>
                                                                                    </div>
                                                                                    <span class="redeem-cost"><span>${el.cost} points</span></span>
                                                                                </li>`).join('');
    }

    // Popup fades in on click of redeem btn
    redeemBtn?.addEventListener('click', () => {
        utils.fadeIn(popup);
    });

    // Popup fades out on click of close btn
    popup.querySelector('.close-icon').addEventListener('click', () => {
        utils.fadeOut(popup);
    });

    // Event delegate of creating & sending reward log to backend if child has enough points to redeem. Shows also corresponding messages related to logic. 
    document.getElementById('redeem-list').addEventListener('click', async (e) => {
        const node = e.target;
        const allRewards = await rewardModel.getAll();

        if (node.classList.contains('redeem-link')) {
            const rewardId = +node.closest('li').getAttribute('data-id');

            let cost = allRewards.filter(el => el.id === rewardId)[0]?.cost;
            const user = await authService.getAuthUser();
            let balance = await dataManager.service.findBalanceForKid(user.id);
            if (cost.substr(1) > balance) {
                utils.showMessage('popup-content', 'msg-not-redeem');
                return;
            }
            await activityModel.addOrUpdate({ childId: parseInt(childId), rewardId, date: Date.now() });
            renderIcons();
            utils.showMessage('popup-content', 'msg-redeem');
            popup.querySelector('.message .reward-name').innerHTML = cost.substr(1);
            
            renderBalanceInPop();
            utils.showWelcome(utils.getNameFirstLetterUpp(user.name), await dataManager.service.findBalanceForKid(user.id));
            document.getElementById('balance').innerHTML = await service.findBalanceForKid(childId);
        }
    });
    // Call of functions
    renderRewardsList();
    renderBalanceInPop();
    renderIcons();

}
