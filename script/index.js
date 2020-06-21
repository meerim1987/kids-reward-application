import {dataManager} from './data.js';
import {utils} from './utils.js';
import {headerInit} from './header.js';
import {renderLog} from './activity_log.js';

const pageInit = async ({childModel, actionModel, activityModel, service}) => {
    let logEntryCount = await service.findActivityLogCount();
    const logCount = 5;
    let logFirst = 0;

    // Function disabling 'check' animation
    const disableCheckAnimation = (context) => {
        const loader = context.querySelector('.loader');
        loader.classList.remove('active');
        context.querySelector('.check').classList.remove('active');
    }
    // Function outlining errors
    const outlineError = (context, color, fn) => {
        if (fn) fn(context.querySelector('.msg-info'));
        context.querySelectorAll('.select-trigger span').forEach(el => {
            el.parentNode.style.borderColor = '#86b4d9';
            if (!el.getAttribute('data-id')) {
                el.parentNode.style.borderColor = color;
            }
        });
    }

    const popup = document.querySelector('.popup');
    let animationend = false;
    
    // Event handlers
    popup.addEventListener('click', async function (e) {
        const trg = e.target;
        const context = this;
        // Open and close custom select fields
        if (trg.classList.contains('select-trigger') || trg.classList.contains('arrow')) {
            disableCheckAnimation(context);
            const selectWrapper = trg.closest('.select-wrapper');
            selectWrapper.querySelector('.custom').classList.toggle('open');
        }

        if (trg.classList.contains('close-icon')) {
            utils.fadeOut(this);
        }

        // Saving data to Local Storage and rendering log of activities
        if (trg.classList.contains('button')) {
            const childId = document.querySelector('.child-select .select-trigger span').getAttribute('data-id');
            const activId = document.querySelector('.activities-select .select-trigger span').getAttribute('data-id');

            if (childId === null || activId === null) {
                outlineError(context, 'red', utils.fadeIn);
                return;
            }
            
            outlineError(context, '#86b4d9');
            document.querySelector('.msg-info').style.display = "none";
            await activityModel.addOrUpdate({ childId: parseInt(childId), activId: parseInt(activId), date: Date.now() });

            const loader = this.querySelector('.loader');
            loader.classList.add('active');

            if (!animationend) {
                loader.addEventListener('animationend', async () => {
                    this.querySelector('.check').classList.add('active');
                    resetFields();
                    renderLog('log', (await service.findActivityLog(0, 1)), true);
                    logEntryCount++;
                    logFirst++;
                });
                animationend = true;
            }
            
            setTimeout(() => disableCheckAnimation(context), 4000);
        }

    });

    document.querySelector('.activity-log .button-log').addEventListener('click', () => {
        disableCheckAnimation(popup);
        resetFields();
        utils.fadeIn(popup);
    })
    // Event delegate on remove btn
    document.querySelector('.activity-log').addEventListener('click', async (e) => {
        const trg = e.target;
        if (trg.classList.contains('remove')) {
            let liNode = trg.closest('li');
            let id = liNode.getAttribute('id');
            await activityModel.remove(id);
            liNode.remove();
            logEntryCount--;
            logFirst--;
        }
    });

    // Function rendering options in select fields
    const renderOptions = async () => {
        const childOptions = document.querySelector('.child-options');
        const activeOptions = document.querySelector('.activ-options');
        const triggerMsgName = `<span class="option" data-value="">Select child's name</span>`;
        const triggerMsgAction = `<span class="option" data-value="">Select child's deed</span>`;
        const allKids = await childModel.getAll();
        const allActions = await actionModel.getAll();

        childOptions.innerHTML = triggerMsgName + allKids.reduce((html, curr) => html + `<span class="option" data-id="${curr.id}" data-value="${curr.name}">${curr.name}</span>`, '');
        activeOptions.innerHTML = triggerMsgAction + allActions.reduce((html, curr) => html + `<span class="option" data-id="${curr.id}" data-value="${curr.actionName}">${curr.actionName}</span>`, '');
    };

    // Function resetting fields
    const resetFields = () => {
        popup.querySelectorAll('.options .option').forEach(el => {
            if (!el.getAttribute('data-value')) {
                el.classList.add('selected');
                el.click();
            }
        });

        popup.querySelectorAll('.select-trigger').forEach(el => {
            el.style.borderColor = '#86b4d9';
        });
        document.querySelector('.msg-info').style.display = "none";
    }

    // Function selecting items on change on custom select fields
    const selectVal = (id) => {
        document.getElementById(id).addEventListener('click', (e) => {
            const trg = e.target;
            if (trg.classList.contains('option')) {
                const name = trg.getAttribute('data-value');
                const selectPlaceholder = trg.textContent;
                const context = trg.closest('.custom');
                const options = context.querySelectorAll('.child-options .option');
                const options2 = context.querySelectorAll('.activ-options .option');
                const triggerNode = context.querySelector('.select-trigger span');

                options.forEach(el => el.classList.remove('selected'));
                options2.forEach(el => el.classList.remove('selected'));
                trg.classList.add('selected');
                context.classList.remove('open');

                if (name === '') {
                    triggerNode.innerHTML = selectPlaceholder;
                    triggerNode.removeAttribute('data-id');
                } else {
                    triggerNode.innerHTML = name;
                    triggerNode.setAttribute('data-id', trg.getAttribute('data-id'));
                }
            }

        })
    }

    const loadMorebtn = document.getElementById('loadMore');

    // Function rendering button based on logs offset
    const renderLoadMore = async () => {
        renderLog('log', (await service.findActivityLog(logFirst, logCount)));
        logFirst += logCount;
        loadMorebtn.style.display = logFirst >= logEntryCount ? "none" : "block";
    }

    document.getElementById('loadMore').addEventListener('click', async () => renderLoadMore());

    // Call of functions
    await renderOptions();
    selectVal('popup-content');
    await renderLoadMore();
    headerInit();
}

pageInit(dataManager);

