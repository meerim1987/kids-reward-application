import { initDefaultData } from './default_data.js';

// Call of function setting default local storage state if it's empty
initDefaultData();

// Base model for all data collections
class Model {
    constructor(name) {
      this.collectionName = name;
    }
  
    async getById(id) {
      if (!Model.data || !Model.data[this.collectionName]) {
        return null;
      }
  
      return Model.data[this.collectionName].filter(
          (el) => el.id === parseInt(id)
        )[0] || null;
    }

    async getAll() {
      return Model.data[this.collectionName] || [];
    }

    async countAll() {
      return Model.data[this.collectionName]?.length || 0;
    }

    async remove(id) {
      if (
        !Model.data[this.collectionName] ||
        !Model.data[this.collectionName].filter
        ) {
            return false;
        }
  
      Model.data[this.collectionName] = Model.data[this.collectionName].filter(
        (el) => el.id !== parseInt(id)
      );
  
      this.saveData();
      return true;
    }
  
    async addOrUpdate(obj) {
      if (!Model.data[this.collectionName]) {
        Model.data[this.collectionName] = [];
      }
  
      if (obj.id) {
        await this.remove(obj.id);
      } else {
        let newId = 0;
        for (let i = 0; i < Model.data[this.collectionName].length; i++) {
          if (Model.data[this.collectionName][i].id > newId) {
            newId = Model.data[this.collectionName][i].id;
          }
        }
        obj.id = newId + 1;
      }
      Model.data[this.collectionName].push(obj);
      this.saveData();
      return true;
    }
  
    saveData() {
      localStorage.setItem('data', JSON.stringify(Model.data));
    }

    async getListByOffset(offset, count){
      const fullList = await this.getAll();
      const end = offset + count;
      return fullList.slice(offset, end);
    }
  }
  
  const collectionNames = {childModel:'childInfo', actionModel:'actionInfo', activityModel: 'activityLog', rewardModel:'rewardsList', loginModel:'loginInfo'};
  
  export const dataManager = {service: {
    findBalanceForKid: async function(kidId){
      let allLoggedInfo = await dataManager.activityModel.getAll();
      let allLoggedInfoForKid = allLoggedInfo.filter(el => kidId === el.childId);
      
      const allActions = await dataManager.actionModel.getAll();
      const allRewards = await dataManager.rewardModel.getAll();
   
      return allLoggedInfoForKid.reduce((sum, curr) => {
          let points;
          if (curr.activId) {
            points = (allActions.filter(el => el.id === parseInt(curr.activId))[0] || {}).points;
            if (!points) points = 0;
          }
          else if (curr.rewardId) {
            points = (allRewards.filter(el => el.id === parseInt(curr.rewardId))[0] || {}).cost;
            if (!points) points = 0;
          }
          return sum + parseInt(points);
      }, 0);
    },
    findActivityLogCount: async function(kidId){
      let allLoggedInfo = await dataManager.activityModel.getAll();
      allLoggedInfo = allLoggedInfo.filter(el => el.activId);

      if (allLoggedInfo.length === 0) {
        return 0;
      }

      if (kidId) {
        allLoggedInfo = allLoggedInfo.filter(el => kidId === el.childId);
      }

      return allLoggedInfo.length;
    },

    findActivityLog: async function(first, count, kidId, order="desc"){
      let allLoggedInfo = await dataManager.activityModel.getAll();
      allLoggedInfo = allLoggedInfo.filter(el => el.activId);
      
      if (allLoggedInfo.length === 0) {
        return [];
      }

      if (kidId) {
        allLoggedInfo = allLoggedInfo.filter(el => kidId === el.childId);
      }
    
      if (allLoggedInfo.length === 0) {
        return [];
      }

      if (first >= allLoggedInfo.length) {
        return [];
      }

      if (order === 'desc') {
        allLoggedInfo.sort((a, b) => b.date - a.date);
      } else {
        allLoggedInfo.sort((a, b) => a.date - b.date);
      }

      if (first + count > allLoggedInfo.length ) {
          allLoggedInfo.slice(first);
      }

      const allKids = await dataManager.childModel.getAll();
      const allActions = await dataManager.actionModel.getAll();
     
      allLoggedInfo = allLoggedInfo.reduce((arr, curr) => {
          let {name, id} = allKids.filter(el => el.id === parseInt(curr.childId))[0] || {};
          let { actionName, actionDescr, misbehav, points} = allActions.filter(el => el.id === parseInt(curr.activId))[0] || {};
          if (actionName && name && id) arr.push({name, childId:id, actionName, actionDescr, misbehav, points, date: curr.date, id:curr.id});
          return arr;
      }, []);

      allLoggedInfo = allLoggedInfo.slice(first, first + count);
      return allLoggedInfo;
    },
    loginUser: async (login, password) => {
      let user;

      if(login === 'admin' && password === '1234') {
        user = {id:0, name: 'Admin'};
      }

      if(!user) {
        user = (await dataManager.childModel.getAll()).filter(child => child.name.toLowerCase() === login.toLowerCase() && child.password === password)[0];
      }

      if(!user) {
        return null;
      }

      const token = Math.random().toString(36).substring(7);
      await dataManager.loginModel.addOrUpdate({token, userId: user.id, date: new Date()});

      return token;
    },
    findUserByToken: async (token) => {
      const loginEntry = (await dataManager.loginModel.getAll()).filter(entry => entry.token === token)[0]; 

      if(!loginEntry) {
        return null;
      }

      if(loginEntry.userId === 0) {
        return {name: 'Admin', id: 0};
      }

      return (await dataManager.childModel.getAll()).filter(child => child.id === loginEntry.userId)[0] || null;

    },
    getRewards: async childId => {
      const rewardsOfChild = (await dataManager.activityModel.getAll()).filter(el => el.childId === childId && el.rewardId)||[];
      const allRewards = await dataManager.rewardModel.getAll();

      return rewardsOfChild.reduce((arr, curr) => {
        const {rewards, cost, id} = allRewards.filter(reward => reward.id === curr.rewardId)[0]||{};
        if (rewards && cost && id) arr.push({title: rewards, id, cost: parseInt(cost)});
        return arr;
      }, []);
    }

  }};

  Model.data = JSON.parse(localStorage.getItem('data'));
  
  for (name of Object.keys(collectionNames)) {
    dataManager[name] = new Model(collectionNames[name]);
  }


