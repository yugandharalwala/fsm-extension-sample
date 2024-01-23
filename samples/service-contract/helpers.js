//
// Update html dom with provided string value
//
const updateUI = (text) =>
   (document.querySelectorAll('#info')[0].innerText = text);

  const updateElement = (text) =>
     (document.getElementById('test').innerText = text);
    const finalValue=[];
//
// Loop before a token expire to fetch a new one
//
function initializeRefreshTokenStrategy(shellSdk, auth) {

   shellSdk.on(SHELL_EVENTS.Version1.REQUIRE_AUTHENTICATION, (event) => {
      sessionStorage.setItem('token', event.access_token);
      setTimeout(() => fetchToken(), (event.expires_in * 1000) - 5000);
   });

   function fetchToken() {
      shellSdk.emit(SHELL_EVENTS.Version1.REQUIRE_AUTHENTICATION, {
         response_type: 'token' // request a user token within the context
      });
   }

   sessionStorage.setItem('token', auth.access_token);
   setTimeout(() => fetchToken(), (auth.expires_in * 1000) - 5000);
}

//
// Request context with activity ID to return serviceContract assigned
//
function getServiceContract(cloudHost, account, company, activity_id) {
   updateElement('');
   const headers = {
      'Content-Type': 'application/json',
      'X-Client-ID': 'fsm-extension-sample',
      'X-Client-Version': '1.0.0',
      'Authorization': `bearer ${sessionStorage.getItem('token')}`
   };
   const headers1 = {
      'Content-Type': 'application/x-www-form-urlencodedn'
   };

   const token1 = {
      'grant_type': 'client_credentials',
      'client_id': '000176ec-eb15-4c2a-b9c7-d3e28ddfd0a1',
      'client_secret': '30b22792-0cf4-49a1-91c1-d202336f5378'
   };
   const tagBody = {
      "filter": [{
         "field": "name",
         "operator": "=",
         "value": "0020-006"
      }],
      "page": 0,
      "size": 20
   }
   const personsUids = new Map();
   var tagIds = [];
   const scaleTag = new Map();


   return new Promise(resolve => {
      fetch(`https://auth.coresuite.com/api/oauth2/v1/token`,
      {
         method: "POST",
         body: "grant_type=client_credentials&client_id=000178da-38e4-471a-bfa0-0e7fb67bf90b&client_secret=e217dcc4-1107-41f5-a0a6-1b34a7652a16",
         headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
         }
      }).then(response => response.json()).then(function (json) {
         const personQuery = `SELECT DISTINCT u.id,u.firstName+' '+u.lastName as name FROM UnifiedPerson u JOIN Region r ON r.id IN u.regions JOIN Activity a ON r.externalId=a.udf.zActWLA WHERE a.id='${activity_id}'`;
         const tagsQuery = `SELECT r.tag from Requirement r WHERE r.object.objectId='${activity_id}' AND r.mandatory=TRUE`;
         //fetch persons based on activity region
         fetch(`https://${cloudHost}/api/query/v1?account=${account}&company=${company}&dtos=UnifiedPerson.13;Region.10;Activity.13`,
          {
            method: "POST",
            body: JSON.stringify({
               "query": personQuery
            }),
            headers: {
               'Content-Type': 'application/json',
               'X-Client-ID': 'fsm-extension-sample',
               'X-Client-Version': '1.0.0',
               'Authorization': `bearer ${json.access_token}`,
            }
         }).then(response1 => response1.json()).then(function (json1) {
            //updateUI(JSON.stringify(json1))
            json1.data.forEach(function (currentValue) {
               personsUids.set(currentValue.u.id, currentValue.name)
            });
            console.log(personsUids);
         }).then(function (json2) {
            //fetch tag ids by passing activity ids to requirement table
            fetch(`https://${cloudHost}/api/query/v1?account=${account}&company=${company}&dtos=Requirement.10`, {
               method: "POST",
               body: JSON.stringify({
                  "query": tagsQuery
               }),
               headers: {
                  'Content-Type': 'application/json',
                  'X-Client-ID': 'fsm-extension-sample',
                  'X-Client-Version': '1.0.0',
                  'Authorization': `bearer ${json.access_token}`,
               }
            }).then(response2 => response2.json()).then(function (tags) {
               //updateUI(JSON.stringify(json1))
               tags.data.forEach(function (value) {
                  tagIds.push(value.r.tag)
               });
               console.log(tagIds);

            })
            .then(function (json3) {
            tagIds.forEach((tagId) => {

            personsUids.forEach((value,key)=>{
             const tagTechbody = {
                                                   "filter": [{
                                                      "field": "technicianId",
                                                      "operator": "=",
                                                      "value": key
                                                   }],
                                                   "page": 0,
                                                   "size": 20
                                                }
                                                fetch(`https://us.coresystems.net/cloud-skill-service/api/v1/tags/${tagId}/skills/search`,
                                                {
                                                   method: "POST",
                                                   body: JSON.stringify(tagTechbody),
                                                   headers: {
                                                      'Content-Type': 'application/json',
                                                      'X-Client-ID': '000176ec-eb15-4c2a-b9c7-d3e28ddfd0a1',
                                                      'X-Client-Version': 'v4',
                                                      'X-Account-Id': '96474',
                                                      'X-Account-Name': 'agilent_T0',
                                                      'X-Company-Id': '106651',
                                                      'X-Company-Name': 'Agilent_Worldwide',
                                                      'Authorization': `bearer ${json.access_token}`
                                                   }
                                                }).then(profResoonse => profResoonse.json()).then(function (profRes) {
                                                   profRes.content.forEach(function (prof) {
                                                    var test=document.getElementById('test').innerText;
                                                    var htmlCode= test+`<div>Person:  ${personsUids.get(prof.technicianId)}</div><div>Skill:  ${prof.tagName}</div> <div>Proficiency level:  ${prof.proficiencyLevel}</div>`
                                                   // finalValue.push(`\n ${personsUids.get(prof.technicianId)}` + `\n Skill- ${prof.tagName} \n Skill proficiency level :${prof.proficiencyLevel}`);
                                                    console.log(`\n ${personsUids.get(prof.technicianId)}` + `\n Skill- ${prof.tagName} \n Skill proficiency level :${prof.proficiencyLevel}`);
                                                    // updateElement(test+` \n ${personsUids.get(prof.technicianId)}` + `\n Skill- ${prof.tagName} \n Skill proficiency level :${prof.proficiencyLevel}`);
                                                    document.getElementById('#info').innerText=htmlCode;
                                                    //updateUI(test+` \n ${personsUids.get(prof.technicianId)}` + `\n Skill- ${prof.tagName} \n Skill proficiency level :${prof.proficiencyLevel}`);

                                                   });

                                                });


                                            });


                 });
                // updateUI(finalValue.toString());
                 //finalValue=[];
            });

         });
      });

   });
}