
import {utils} from './utils.js';
import {authService} from './utils.js';

export const renderLog = async(id, arr, prepend=false) => {
    const isAdmin = await authService.isAdmin();
    const node = document.getElementById(id);
    const newMU = arr.reduce((html, curr)=> html + `<li id="${curr.id}">
                                                        <div class="child-image">
                                                            <a href="child-profile.html?id=${curr.childId}">
                                                                <img src="./assets/${utils.getAvatar(curr.childId)}.jpg" alt="Profile picture">
                                                            </a>
                                                        </div>
                                                        <div class="log-info">
                                                            <div class="activity-part ${curr.misbehav ? 'misbehav' : ''}"><strong>
                                                            <a class="log-child-name" href="child-profile.html?id=${curr.childId}">${curr.name || ''} </a></strong>${curr.actionName?.toLowerCase() || ''}
                                                                ${curr.actionDescr ? `<div class="description">${curr.actionDescr}</div>` : ''}
                                                                <div class="points">Points: ${curr.points || ''}</div>
                                                            </div>
                                                            <div class="text-muted time">${utils.getDateDetails(new Date(curr.date))} ${isAdmin ? '<a class="remove" href="javascript:">Delete</a> ': ''}</div>
                                                        </div>
                                                    </li>`, '');

    if (prepend) {
        node.innerHTML = newMU + node.innerHTML;
    } else {
        node.innerHTML += newMU;
    }  
};
