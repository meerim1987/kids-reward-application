# kids-reward-application
Kid Reward Application based on points system. Kids earn their points depending on their good or bad deeds and have a chance to redeem them for the award they choose. Parents have admin rights and can add kids, the standard lists of deeds they do daily and of rewards with points in the admin page. The three lists are not associated in admin page, but on frontend parent later can associate certain child with specific good or bad action. In that way kids can see the log of their deeds they accomplished so far in main log and also on profile page where he or she has a chance to redeem (when logged in) his points, which is the most interesting part of the application. When child redeems his/her deserved points, its reward's sticker also appears on his/her profile, appreciating kids for their good behaviour and inspiring them to continue doing good deeds.<br /> 
<br />
Click [Demo](https://meerim1987.github.io/kids-reward-application/?target=_blank) to see the project in live. 

**Technical features:**
 - App is Vanilla JS, HTML and CSS;
 - Emulates backend with data.js using Local Storage;
 - Code is organized by ES Modules;
 - App uses basic Authentication saving state in Session Storage;
 - The application with all its components is totally responsive;
 - On first openning the app is initialized with default data;

 
 Admin user (parent) has right to add, delete data in admin page, also can add/associate the deed with specific kid (log activity) on Main page. Only admin has right to delete any log entry throughout the app. 
 Child when logged in, can view all pages except admin. Also child can redeem points on his/her profile based on his/her balance status. 

**Credentials of some of kids for testing**
 Admin: login: 'admin', passwd: '1234';<br />
 Kids: login: 'Bill', passwd: 'kid12';<br />
       login: 'Laetitia', passwd: 'kid7';<br />
       login: 'Sofia', passwd: 'kid3';<br />
       login: 'Tom', passwd: 'kid2';<br />

        






