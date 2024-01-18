// 
// Update html dom with provided string value
//
const updateUI = (text) =>
  (document.querySelectorAll('#info')[0].innerText = text);

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
      response_type: 'token'  // request a user token within the context
    });
  }

  sessionStorage.setItem('token', auth.access_token);
  setTimeout(() => fetchToken(), (auth.expires_in * 1000) - 5000);
}

// 
// Request context with activity ID to return serviceContract assigned
//
function getServiceContract(cloudHost, account, company, activity_id) {
  





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
    'client_id':'000176ec-eb15-4c2a-b9c7-d3e28ddfd0a1',
    'client_secret':'30b22792-0cf4-49a1-91c1-d202336f5378'
  };
  const tagBody={
      "filter": [{
        "field": "name",
        "operator": "=",
        "value": "0020-006"
      }], 
      "page": 0,
      "size": 20 
    }
    const personsUids=new Map();
  var tagIds=[];
  const scaleTag = new Map();
  return new Promise(resolve => {
    fetch(`https://auth.coresuite.com/api/oauth2/v1/token`, {
      method: "POST",
      body: "grant_type=client_credentials&client_id=000178da-38e4-471a-bfa0-0e7fb67bf90b&client_secret=e217dcc4-1107-41f5-a0a6-1b34a7652a16",
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    }).then(response => response.json()).then(function(json) {

      fetch(`https://us.coresystems.net/optimization/api/v2/jobs/${activity_id}/best-matching-technicians`, {
        mode: 'no-cors',
        credentials: 'include',
        method: "POST",
        body: JSON.stringify({ "policy": "Distance", "resources": { "includeInternalPersons": true, "includeCrowdPersons": false, "personIds": ['4A1591D031834646A8DBC03092E35E38'] }, "schedulingOptions": { "defaultDrivingTimeMinutes": 30, "maxResults": 10, "timezoneId": "Asia/Calcutta" }, "additionalDataOptions": { "useBlacklist": true, "enableRealTimeLocation": true, "realTimeLocationThresholdInMinutes": 15, "includePlannedJobsAsBookings": false, "includeReleasedJobsAsBookings": true } }),
        headers:{
          'Content-Type': 'application/json',
          'X-Client-ID': '000176ec-eb15-4c2a-b9c7-d3e28ddfd0a1',
          'X-Client-Version': 'v4',
          'X-Account-Id':'96474',
          'X-Account-Name':'agilent_T0',
          'X-Company-Id':'106651',
          'X-Company-Name':'Agilent_Worldwide',
          'Access-Control-Allow-Origin': 'https://yugandharalwala.github.io',
          'Access-Control-Allow-Credentials': true,
          'Access-Control-Allow-Methods':'GET, DELETE, HEAD, OPTIONS',
          'Authorization': `bearer ${json.access_token}`
        }
      }).then(response2 => response2.json()).then(function(json3) {updateUI(JSON.stringify(json3))});

    // fetch(`https://${cloudHost}/cloud-skill-service/api/v1/tags/search?account=${account}&company=${company}`, {
    //   method: "POST",
    //   body: JSON.stringify(tagBody),
    //   headers:{
    //     'Content-Type': 'application/json',
    //     'X-Client-ID': 'fsm-extension-sample',
    //     'X-Client-Version': '1.0.0',
    //     'Authorization': `bearer ${json.access_token}`,
    //   }
    //   }).then(response1 => response1.json()).then(function(json1) {updateUI(json1.content[0].id)});

   const personQuery= `SELECT DISTINCT u.id,u.firstName+' '+u.lastName as name FROM UnifiedPerson u JOIN Region r ON r.id IN u.regions JOIN Activity a ON r.externalId=a.udf.zActWLA WHERE a.id='${activity_id}'`;
    const tagsQuery=`SELECT r.tag from Requirement r WHERE r.object.objectId='${activity_id}'`;
    //fetch persons based on activity region
   fetch(`https://${cloudHost}/api/query/v1?account=${account}&company=${company}&dtos=UnifiedPerson.13;Region.10;Activity.13`,{
  method: "POST",
  body: JSON.stringify({"query":personQuery}),
     headers:{
        'Content-Type': 'application/json',
        'X-Client-ID': 'fsm-extension-sample',
        'X-Client-Version': '1.0.0',
        'Authorization': `bearer ${json.access_token}`,
      }
 }).then(response1 => response1.json()).then(function(json1) {
  //updateUI(JSON.stringify(json1))
  json1.data.forEach(function(currentValue){
    personsUids.set(currentValue.u.id,currentValue.name)
   });
  console.log(personsUids);
}).then(function(json2){
  //fetch tag ids by passing activity id to requirement table
  fetch(`https://${cloudHost}/api/query/v1?account=${account}&company=${company}&dtos=Requirement.10`,{
    method: "POST",
    body: JSON.stringify({"query":tagsQuery}),
       headers:{
          'Content-Type': 'application/json',
          'X-Client-ID': 'fsm-extension-sample',
          'X-Client-Version': '1.0.0',
          'Authorization': `bearer ${json.access_token}`,
        }
   }).then(response2 => response2.json()).then(function(tags) {
    //updateUI(JSON.stringify(json1))
    tags.data.forEach(function(value){
      tagIds.push(value.r.tag)
     });
    console.log(tagIds);

})
// .then(function(json3){
//  const tbody= {
//     "filter": [{
//       "field": "id",
//       "operator": "=",
//       "value": tagIds[0]
//     }], 
//     "page": 0,
//     "size": 20 
//   }
//   //get scale ids by passing the tag ids into Tag search API
//   fetch(`https://us.coresystems.net/cloud-skill-service/api/v1/tags/search`, {
//     method: "POST",
//     body: JSON.stringify(tbody),
//     headers:{
//       'Content-Type': 'application/json',
//       'X-Client-ID': '000176ec-eb15-4c2a-b9c7-d3e28ddfd0a1',
//       'X-Client-Version': 'v4',
//       'X-Account-Id':'96474',
//       'X-Account-Name':'agilent_T0',
//       'X-Company-Id':'106651',
//       'X-Company-Name':'Agilent_Worldwide',
//       'Authorization': `bearer ${json.access_token}`
//     }
//   }).then(tagResponse => tagResponse.json()).then(function(tagData) {
//     tagData.content.forEach(function(scale){
//       scaleTag.set(tagIds[0],scale.scaleId)
//        });  
//   })
  .then(function(tagTechSearch){
    tagIds.forEach((tagId,index) => {
      const tagTechbody= {
        "filter": [{
          "field": "technicianId",
          "operator": "=",
          "value": personsUids.keys().next().value
        }], 
        "page": 0,
        "size": 20 
      }
      fetch(`https://us.coresystems.net/cloud-skill-service/api/v1/tags/${tagId}/skills/search`, {
    method: "POST",
    body: JSON.stringify(tagTechbody),
    headers:{
      'Content-Type': 'application/json',
      'X-Client-ID': '000176ec-eb15-4c2a-b9c7-d3e28ddfd0a1',
      'X-Client-Version': 'v4',
      'X-Account-Id':'96474',
      'X-Account-Name':'agilent_T0',
      'X-Company-Id':'106651',
      'X-Company-Name':'Agilent_Worldwide',
      'Authorization': `bearer ${json.access_token}`
    }
  }).then(profResoonse=>profResoonse.json()).then(function(profRes){

    profRes.content.forEach(function(prof) {
      updateUI(`${personsUids.get(prof.technicianId)}`+`\n Skill- ${prof.tagName} \n Skill proficiency level :${prof.proficiencyLevel}`);
    });
  
  });

  });

  });
});

  });
});

  });
  // return new Promise(resolve => {

  //   // Fetch Activity object
  //   fetch(`https://${cloudHost}/api/data/v4/Activity/${activity_id}?dtos=Activity.37&account=${account}&company=${company}`, {
  //     headers
  //     })
  //       .then(response => response.json())
  //       .then(function(json) {

  //         const activity = json.data[0].activity;
  //         // Fetch all ServiceContractEquipment
  //         fetch(`https://${cloudHost}/api/data/v4/ServiceContractEquipment?dtos=ServiceContractEquipment.12&account=${account}&company=${company}`, {
  //           headers
  //           })
  //             .then(response => response.json())
  //             .then(function(json) {

  //               const serviceContractEquipment = json.data.find(contract => contract.serviceContractEquipment.equipment === activity.equipment);
  //               if (!serviceContractEquipment) {
	// 		        console.log('Yugandhar Testing 1');
  //                 resolve(null);
  //               } else {
  //                 fetch(`https://${cloudHost}/api/data/v4/ServiceContract/${serviceContractEquipment.serviceContractEquipment.serviceContract}?dtos=ServiceContract.13&account=${account}&company=${company}`, {
  //                   headers
  //                   })
  //                     .then(response => response.json())
  //                     .then(function(json) {
	// 		                console.log('Yugandhar Testing 2');
  //                       resolve(json.data[0].serviceContract);
  //                     });
  //               }

  //             });

  //       });

  // });


    // fetch(`https://us.coresystems.net/optimization/api/v2/jobs/${activity_id}/best-matching-technicians`, {
  //   mode: 'no-cors',
  //   credentials: 'include',
  //   method: "POST",
  //   body: JSON.stringify({ "policy": "Distance", "resources": { "includeInternalPersons": true, "includeCrowdPersons": false, "personIds": personsUids }, "schedulingOptions": { "defaultDrivingTimeMinutes": 30, "maxResults": 10, "timezoneId": "Asia/Calcutta" }, "additionalDataOptions": { "useBlacklist": true, "enableRealTimeLocation": true, "realTimeLocationThresholdInMinutes": 15, "includePlannedJobsAsBookings": false, "includeReleasedJobsAsBookings": true } }),
  //   headers:{
  //     'Content-Type': 'application/json',
  //     'X-Client-ID': '000176ec-eb15-4c2a-b9c7-d3e28ddfd0a1',
  //     'X-Client-Version': 'v4',
  //     'X-Account-Id':'96474',
  //     'X-Account-Name':'agilent_T0',
  //     'X-Company-Id':'106651',
  //     'X-Company-Name':'Agilent_Worldwide',
  //     'Access-Control-Allow-Origin': 'https://yugandharalwala.github.io',
  //     'Access-Control-Allow-Credentials': true,
  //     'Access-Control-Allow-Methods':'GET, DELETE, HEAD, OPTIONS',
  //     'Authorization': `bearer ${json.access_token}`
  //   }
  // }).then(response2 => response2.json()).then(function(json3) {updateUI(JSON.stringify(json3))});
}

