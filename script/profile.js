import {dataManager} from './data.js';
import {utils} from './utils.js';
import {headerInit} from './header.js';
import {redeem} from './redeem.js';
import {renderLog} from './activity_log.js';

const profileInit = async ({ childModel, activityModel, service }) => {
    const msg = document.querySelector('.message-log');

    // Getting child id from url
    const params = new URL(location.href).searchParams;
    const urlChildId = parseInt(params.get('id'));

    // Getting number of logs
    let logEntryCount = await service.findActivityLogCount(urlChildId);
    // offset init
    const logCount = 5;
    let logFirst = 0;
    msg.style.display = logEntryCount === 0 ? 'block' : 'none';
  
    // Function calculates offset and shows the set amount of logs for certain child with load more btn
    const renderLoadMore = async () => {
        const loadMorebtn = document.getElementById('loadMore');
        renderLog('log', (await service.findActivityLog(logFirst, logCount, urlChildId)));
        logFirst += logCount;
        loadMorebtn.style.display = logFirst >= logEntryCount ? "none" : "block";
    }

    // Event delegate on click removing the corresponding log and recalculating of offsets
    document.querySelector('.profile-log .activity-log').addEventListener('click', async(e) => {
        const trg = e.target;
        if (trg.classList.contains('remove')) {
            if (trg.classList.contains('remove')) {
                let liNode = trg.closest('li');
                let id = liNode.getAttribute('id');
                await activityModel.remove(id);
                liNode.remove();
                logEntryCount--;
                logFirst--;
            }
        }
    });

    renderLoadMore();
    document.getElementById('loadMore').addEventListener('click', async() => renderLoadMore());

    // Renders profile details
    const renderProfileDetails = async() => {
        let childInfo = await childModel.getById(urlChildId);
        document.getElementById('profile-image').innerHTML = `<img src="./assets/${utils.getAvatar(urlChildId)}.jpg" alt="Profile picture"></img>`;
        const profDetails = document.getElementById('profile-details');
        profDetails.querySelector('.name').innerHTML = childInfo.name;
        let age = childInfo.age;
        profDetails.querySelector('.age').innerHTML = age > 1 ? `${age} years` : `${age} year`; 
        document.getElementById('balance').innerHTML = await service.findBalanceForKid(urlChildId);
    }

    // Call of async functions
    await renderProfileDetails();
    await redeem(urlChildId);
    await headerInit();

};

profileInit(dataManager);

