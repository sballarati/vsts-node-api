/// <reference path="typings/index.d.ts" />

import * as vm from './api/WebApi';
import * as wa from './api/WorkItemTrackingApi';
import * as wi from './api/interfaces/WorkItemTrackingInterfaces';
import * as vss from './api/interfaces/Common/VSSInterfaces';

var collectionUrl = "https://seballarati.visualstudio.com";

let project: string = "Sebas Project Feedback Test";

let token: string = "mypat";

let creds = vm.getPersonalAccessTokenHandler(token);

var connection = new vm.WebApi(collectionUrl, creds);

let vstsWI: wa.IWorkItemTrackingApi = connection.getWorkItemTrackingApi();

async function getWI() {
    let wiid: number = 1;
    let workitem: wi.WorkItem = await vstsWI.getWorkItem(wiid);

    console.log(workitem.url);
}

async function createWI() {
    let wijson: vss.JsonPatchDocument = [{ "op": "add", "path": "/fields/System.Title", "value": "Bug created via NodeJS client" }];
    let witype: string = "Bug";
    let cWI: wi.WorkItem = await vstsWI.createWorkItem(null, wijson, project, witype);
    console.log(cWI.id);
}

async function updateWiTags(id: number, tags: string) {
    let wijson: vss.JsonPatchDocument = [{ "op": "add", "path": "/fields/System.Tags", "value": tags }];
    let cWI: wi.WorkItem = await vstsWI.updateWorkItem(null, wijson, id)
        .then((wi) => {
            console.log(wi.id + " updated");
            return wi;
        })
        .catch((err) => {
            console.error(err);
        });
}

async function getMultipleWIasync(ids: number[]) {
    let workitems: wi.WorkItem[] = await vstsWI.getWorkItems(ids);
    return workitems;
}

let wiIdsToUpdate: number[] = [7133, 7134, 7135, 7136]; // tests ids
let newTagToAdd: string = "New Tag";

let updatedItems: number = 0;
let notChangedItems: number = 0;

getMultipleWIasync(wiIdsToUpdate).then((wiResponse) => {
    for (let wi of wiResponse) {
        console.log(wi.id);
        let tags: string = wi.fields["System.Tags"];
        console.log("Current tags: " + tags);

        if (tags) {
            if (tags.includes(newTagToAdd)) {
                console.warn("Already contains the new tag.");
                notChangedItems++;
                continue;
            }
            tags = tags + "; " + newTagToAdd;
        }
        else {
            tags = newTagToAdd;
        }
        console.log("New tags: " + tags + " to add to " + wi.id);
        updatedItems++;
        updateWiTags(wi.id, tags);
    }

    console.log("Updated items: " + updatedItems);
    console.log("Not updated: " + notChangedItems);
}).catch((err) => {
    console.log(err);
});

