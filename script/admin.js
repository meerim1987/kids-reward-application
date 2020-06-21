import {dataManager} from './data.js';
import {utils, authService} from './utils.js';

const adminInit = async ({ childModel, actionModel, rewardModel }) => {
    // Init of variables
    const childTable = document.querySelector('.child-list-cont');
    const actionTable = document.querySelector('.action-list-cont');
    const rewardsTable = document.querySelector('.rewards-list-cont');
    const adminBoard = document.querySelector('.admin-board');
    const colUmn = document.querySelector('.col-2');
    const msgAuth = document.querySelector('.message-authoriz');
    const numOnPage = 5;

    // Function disabling 'check' animation
    const disableCheckAnimation = (context) => {
        const loader = context.querySelector('.loader');
        loader.classList.remove('active');
        context.querySelector('.check').classList.remove('active');
    }

    // Function rendering pagination
    const renderPagintn = (toAppendNode, qty, fn, activeIndex = 1) => {
        if (qty < 2) {
            toAppendNode.innerHTML = '';
            return;
        }

        let html = '';
        for(let i=1; i<=qty; i++) {
            html += `<a data-id="${i}"${i==activeIndex? ` class="active"`: ''} href="javascript:">${i}</a>`;
        }
        const parent  = document.createElement('div');
        parent.classList.add('paginatn-cont');
        parent.innerHTML = html;
        toAppendNode.innerHTML = '';
        toAppendNode.appendChild(parent);
        
        parent.addEventListener('click', function(e){
            this.querySelectorAll('a').forEach(el => el.classList.remove('active'));
            e.target.classList.add('active');
            fn(parseInt(e.target.getAttribute('data-id')));
        });
    }

    // Component which renders all three tables, with removing items and activating pagination
    const renderTable = async(data, tableFields, tableNode, initHanlder) => {
        const getPagesCount = async () => Math.ceil((await data.countAll())/numOnPage) || 1;      
        let pagesNum = await getPagesCount();
        let pageVal = 1;
        const context = tableNode.closest('.table-wrap');    
        context.querySelector('.message').style.opacity = (await data.countAll()) === 0 ? 1 : 0;
        
        const renderPage = async (page) => {
            const dataVal = await data.getListByOffset((page-1)*numOnPage, numOnPage);
            
            pageVal = page;
            if (dataVal.length === 0) {
                tableNode.innerHTML = '';
                return;
            }
            
            const headHtml = tableFields.reduce((html, [,fieldLabel]) => {
                return html + `<th tabindex="0" rowspan="1" colspan="1" aria-label="${fieldLabel}">${fieldLabel}</th>`;
            }, '');

            const bodyHtml = dataVal.reduce((html, entry) => {
                return html + `<tr id="${entry.id}" role="row">
                    ${tableFields.map(([prop, , className]) => `<td${className ? ` class="${className}"` : ''}>${entry[prop]}</td>`).join('')}
                    <td><a class="remove-icon" href="javascript:"></a></td>
                </tr>`
            }, '');

            tableNode.innerHTML = `<table class="table action-list">
                <thead>
                    <tr role="row">
                        ${headHtml}
                        <th tabindex="0" rowspan="1" colspan="1"></th>
                    </tr>
                </thead>
                ${bodyHtml}
            </table>`;
        };

        const renderPagination = (active) => renderPagintn(context.querySelector('.paginator'), pagesNum, renderPage, active);

        await renderPage(pageVal);
        renderPagination(pageVal);

        const removeRecord = async (e) => {
            const trg = e.target;
            if (trg.classList.contains('remove-icon')) {

                if (window.confirm("Do you really want to delete?")) { 
                    const id = trg.closest('tr').getAttribute('id');
                    await data.remove(parseInt(id));
                    const newPagesNum = await getPagesCount();

                    if(newPagesNum < pagesNum && pageVal == pagesNum) {
                        pageVal--;
                    }

                    if(newPagesNum < pagesNum) {
                        pagesNum = newPagesNum;
                    }

                    await renderPage(pageVal);

                    renderPagination(pageVal);
                }
                
            }
        }
    
        if (initHanlder) {
            tableNode.addEventListener('click', removeRecord); 
        }
   }

    const renderActionTable = async (init = false) => await renderTable(
        actionModel, 
        [
            ['actionName','Name of action', 'action-name'], 
            ['points', 'Points', 'points'], 
            ['actionDescr', 'Description', 'action-description']
        ], 
        actionTable,
        init
    );
    const renderChildTable = async (init = false) => await renderTable(
        childModel, 
        [['name', 'Name of child'], ['age', 'Age']], 
        childTable,
        init
    );
    const renderRewardsTable = async (init = false) => await renderTable(
        rewardModel, 
        [['rewards', 'Reward', 'rewards-title'], ['cost', 'Cost', 'cost']], 
        rewardsTable,
        init
    );

    // Call of functions rendering tables
    await renderActionTable(true);
    await renderChildTable(true);
    await renderRewardsTable(true);    

    // Function which renders numbers(action points, age, reward points)
    const renderNumbers = (id, label, node, min = "1", max = "5") => {
        const domNode = document.querySelector(node);
        domNode.innerHTML = `<label for="${id}" class="form__label required">${label}</label>
                            <div>
                                <a href="javascript:" class="down"></a>
                                <input class="quantity data__field" id="${id}" name="quantity" value="0" type="number" min="${min}" max="${max}" required>
                                <a href="javascript:" class="plus"></a>
                            </div>`;

        const inputNode = domNode.querySelector('input[type="number"]');
        domNode.querySelector('.down').addEventListener('click', () => inputNode.stepDown());
        domNode.querySelector('.plus').addEventListener('click', () => inputNode.stepUp());
    }

    // Event handlers
    document.querySelectorAll('.app form').forEach(el => {
        el.addEventListener('change', (e) => {
            if (e.target.classList.contains('form__field')) {
                const app = e.target.closest('.app');
                disableCheckAnimation(app);
            }
        })
    });

 
    // Rendering Child details and showing feedback message on animation end
    const childContext = document.querySelector('.child-board');
    const loader = childContext.querySelector('.loader');
    loader.addEventListener('animationend', async () => { 
        childContext.querySelector('.check').classList.add('active');
        await renderChildTable();
        utils.showFeedbackMsg('Child info has been added!');
    });

    // Sending child details to backend and resetting fields
    childContext.querySelector('.child-info').addEventListener('submit', async (e) => {
        e.preventDefault();
        await childModel.addOrUpdate(utils.getDataFromInputs(childContext));
        loader.classList.add('active');
        utils.resetInputFields(childContext);
    });


    const achievContext = document.querySelector('.achiev-board');
    utils.substrVal(achievContext, 'actionName');

    // Rendering Action details and showing feedback message  on animation end
    const loaderActions = achievContext.querySelector('.loader');
    loaderActions.addEventListener('animationend', async() => {
        achievContext.querySelector('.check').classList.add('active');
        await renderActionTable();
        utils.showFeedbackMsg('Action info has been added!');
    });
    
    // Sending action details to backend and resetting fields
    achievContext.querySelector('.activities-cont').addEventListener('submit', async(e) => {
        e.preventDefault();
        const newObj = (utils.getDataFromInputs(achievContext));
        newObj.misbehav = achievContext.querySelector('.checkbox input').checked;
        await actionModel.addOrUpdate(newObj);
        loaderActions.classList.add('active');
        utils.resetInputFields(achievContext);
        const inputNode = achievContext.querySelector('.checkbox input');
        inputNode.checked = true;
        inputNode.click();
    });



    const rewardsContext = document.querySelector('.rewards-board');
    utils.substrVal(rewardsContext, 'rewards');
    
    // Rendering Reward details and showing feedback message on animation end
    const loaderRewards = rewardsContext.querySelector('.loader');
    loaderRewards.addEventListener('animationend', async () => {
        rewardsContext.querySelector('.check').classList.add('active');
        await renderRewardsTable();
        utils.showFeedbackMsg('Rewards info has been added!');
    });

    // Sending reward details to backend and resetting fields
    rewardsContext.querySelector('.rewards-cont').addEventListener('submit', async(e) => {
        e.preventDefault();
        await rewardModel.addOrUpdate(utils.getDataFromInputs(rewardsContext));
        loaderRewards.classList.add('active');
        utils.resetInputFields(rewardsContext);
    });

    //Sliding in, slide out effects
    adminBoard.addEventListener('click', function(e){
        const node = e.target;
        if (node.classList.contains('add-icon')) {
            const context = node.closest('.app');
            // Disabling check loader
            disableCheckAnimation(context);
            const inputNode = this.querySelector('.checkbox input');
            inputNode.checked = true;
            inputNode.click();
            

            utils.resetInputFields(context);
            context.classList.add('slideUp');
            const slidingNode = context.querySelector('form');
            setTimeout(() => {
                slidingNode.style.transform = "translateY(0)";
            }, 50);

        }
        if (node.classList.contains('remove-icon')) {
            const context = node.closest('.app');
            const slidingNode = context.querySelector('form');
            slidingNode.style.transform = '';
            context.classList.remove('slideUp');
        }
    });

    // Call of functions
    renderNumbers('age', 'Age', '.child-board .number-input', 1, 18);
    renderNumbers('points', 'Points', '.achiev-board .number-input');
    renderNumbers('cost', 'Cost', '.rewards-board .number-input', -5, -1);

    // Misdeed checkbox activation
    document.querySelector('.checkbox input[type="checkbox"]').addEventListener('change', function () {
        const context = this.closest('.app');
        const inputNode = context.querySelector('input.quantity');

        if (this.checked) {
            inputNode.setAttribute('min', '-5');
            inputNode.setAttribute('max', '-1');
        } else {
            inputNode.setAttribute('min', '1');
            inputNode.setAttribute('max', '5');
        }
    });

    // Shows admin to user with parent rights and hides for kids
    if (await authService.isAdmin()) {
        adminBoard.style.display = colUmn.style.display = "block";
        msgAuth.style.display = "none";

    } else {
        adminBoard.style.display = colUmn.style.display = "none";
        msgAuth.style.display = "block";
    }

}

adminInit(dataManager);