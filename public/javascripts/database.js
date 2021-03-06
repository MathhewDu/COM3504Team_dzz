////////////////// DATABASE //////////////////
// the database receives from the server the following structure

/** class chatObject{
 *  constructor (room:int, username:string, msgID:int, msg:string) {
 *
 *    this.room= room;
 *    this.username= username,
 *    this.msgID=msgID;
 *    this.msg= msg;
 *  }
 *
 *}
 */
let db;
let imgdb;
let cvsdb;
import * as idb from './idb/index.js';
const CHAT_DB_NAME= 'db_chat_1';
const CHAT_STORE_NAME= 'store_chat';
const IMG_DB_NAME= 'db_img_1';
const IMG_STORE_NAME= 'store_img';
const CANVAS_DB_NAME = 'db_canvas_1';
const CANVAS_STORE_NAME = 'store_canvas';

let msgid = 0;
/**
 * it inits the database
 */
async function initDatabase(){
    if (!db) {
        db = await idb.openDB(CHAT_DB_NAME, 2, {
            upgrade(upgradeDb, oldVersion, newVersion) {
                if (!upgradeDb.objectStoreNames.contains(CHAT_STORE_NAME)) {
                    let ChatDB = upgradeDb.createObjectStore(CHAT_STORE_NAME, {
                        keyPath: 'id',
                        autoIncrement: true
                    });
                    ChatDB.createIndex('roomNo', 'roomNo', {unique: false, multiEntry: true});
                }
            }
        });}
    if (!imgdb) {
        imgdb = await idb.openDB(IMG_DB_NAME, 2, {
            upgrade(upgradeDb, oldVersion, newVersion) {
                if (!upgradeDb.objectStoreNames.contains(IMG_STORE_NAME)) {
                    let imgDB = upgradeDb.createObjectStore(IMG_STORE_NAME, {
                        keyPath: 'id',
                        autoIncrement: true
                    });
                    imgDB.createIndex('url', 'url', {unique: false, multiEntry: true});
                }
            }
        });}
    if (!cvsdb) {
        cvsdb = await idb.openDB(CANVAS_DB_NAME, 2, {
            upgrade(upgradeDb, oldVersion, newVersion) {
                if (!upgradeDb.objectStoreNames.contains(CANVAS_STORE_NAME)) {
                    let cvsDB = upgradeDb.createObjectStore(CANVAS_STORE_NAME, {
                        keyPath: 'id',
                        autoIncrement: true
                    });
                    cvsDB.createIndex('RoomAndUrl', 'RoomAndUrl', {unique: false, multiEntry: true});
                }
            }
        });}
}
window.initDatabase= initDatabase;

/**
 * it saves the chat data for a room in localStorage
 * @param room
 * @param chatObject
 */
async function storeChatData(roomNo,user,msgID,msg) {
    if (!db)
        await initDatabase();
    if (db) {
        try {
            let tx = await db.transaction(CHAT_STORE_NAME, 'readwrite');
            let store = await tx.objectStore(CHAT_STORE_NAME);
            await store.put({"roomNo": roomNo, "user": user, "msgID": msgID, "msg": msg});
            await tx.complete;
        } catch (error) {
            console.log('IndexedDB not available');
        }
        ;
    } else {
        console.log('IndexedDB not available');
    }
}
window.storeChatData= storeChatData;


async function storeImageData(url,imageObject) {
    if (!imgdb)
        await initDatabase();
    if (imgdb) {
        try {
            let tx = await imgdb.transaction(IMG_STORE_NAME, 'readwrite');
            let store = await tx.objectStore(IMG_STORE_NAME);
            await store.put(imageObject);
            await tx.complete;
            console.log('added item to the store! '+JSON.stringify(imageObject));
        } catch (error) {
            console.log('IndexedDB not available');
        };
    } else {
        console.log('IndexedDB not available');
    }gohome()//should be clear()
}
window.storeImageData= storeImageData;

async function storeCanvasData(RoomAndUrl, width, height,prevX, prevY, currX, currY, color, thickness) {
    if (!cvsdb)
        await initDatabase();
    if (cvsdb) {
        try {
            let tx = await cvsdb.transaction(CANVAS_STORE_NAME, 'readwrite');
            let store = await tx.objectStore(CANVAS_STORE_NAME);
            await store.put({"RoomAndUrl": RoomAndUrl,"width": width,"height": height, "prevX": prevX, "prevY": prevY, "currX": currX, "currY": currY, "color": color, "thickness": thickness});
            await tx.complete;
        } catch (error) {
            console.log('IndexedDB not available');
        }
        ;
    } else {
        console.log('IndexedDB not available');
    }
}
window.storeCanvasData= storeCanvasData;
/**
 * it retrieves the histories chat data for a room from the database
 * @param room
 */
async function getChatData(room) {
    if (!db)
        await initDatabase();
    if (db) {
        try {
            console.log('fetching: ' + room);
            let tx = await db.transaction(CHAT_STORE_NAME, 'readonly');
            let store = await tx.objectStore(CHAT_STORE_NAME);
            let index = await store.index("roomNo");
            let histories = await index.getAll(IDBKeyRange.only(room));
            await tx.complete;
            return histories;
        } catch (error) {
            console.log(error);
        }
    } else {
        console.log('IndexedDB not available');
    }
}
window.getChatData= getChatData;

async function getImgData(url) {
    if (!imgdb)
        await initDatabase();
    if (imgdb) {
        try {
            console.log('fetching: ' + url);
            let tx = await imgdb.transaction(IMG_STORE_NAME, 'readonly');
            let store = await tx.objectStore(IMG_STORE_NAME);
            let index = await store.index('url');
            let imagedata = await index.getAll(IDBKeyRange.only(url));
            await tx.complete;
            return imagedata;
        } catch (error) {
            console.log(error);
        }
    } else {
        console.log('IndexedDB not available');
    }
}
window.getImgData= getImgData;

async function getCanvasData(RoomAndUrl) {
    if (!cvsdb)
        await initDatabase();
    if (cvsdb) {
        try {
            let tx = await cvsdb.transaction(CANVAS_STORE_NAME, 'readonly');
            let store = await tx.objectStore(CANVAS_STORE_NAME);
            let index = await store.index("RoomAndUrl");
            let canvasdata = await index.getAll(IDBKeyRange.only(RoomAndUrl));
            await tx.complete;
            return canvasdata;
        } catch (error) {
            console.log(error);
        }
    } else {
        console.log('IndexedDB not available');
    }
}
window.getCanvasData= getCanvasData;

async function getUsername(dataR) {
    if (dataR.user == null && dataR.user === undefined)
        return "unavailable";
    else return dataR.user;
}
window.getUsername=getUsername;

async function createMsgID(roomNo,name,chatText) {
    let chat = await getChatData(roomNo);
    if (chat.length == 0)
        msgid=1;
    else
        msgid = chat[chat.length-1].id+1;
    msgid = roomNo.toString()+msgid.toString();
    storeChatData(roomNo,name,msgid,chatText);
}
window.createMsgID=createMsgID;

async function PrintHistoryMsg(room) {
    let chat = await getChatData(room);
    if (chat == null && chat === undefined)
        return "unavailable";
    else
        for (let i = 0; i < chat.length; ++i){
            let msg = '<b>' + chat[i]["user"] + ':</b> '+chat[i]["msg"]
            writeOnHistory(msg);
        }
}
window.PrintHistoryMsg=PrintHistoryMsg;

async function PrintCanvas(ctx,RoomAndUrl) {
    let canvasdata = await getCanvasData(RoomAndUrl);
    if (canvasdata == null && canvasdata === undefined)
        return "unavailable";
    else
        for (let i = 0; i < canvasdata.length; ++i){
            let cv=canvasdata[i]
            drawOnCanvas(ctx,cv["width"],cv["height"],cv["prevX"],cv["prevY"],cv["currX"],cv["currY"],cv["color"],cv["thickness"]);
        }
}
window.PrintCanvas=PrintCanvas;

async function Remove() {
    var req = indexedDB.deleteDatabase('db_chat_1');
    var req2 = indexedDB.deleteDatabase('db_canvas_1');
    req.onsuccess = function () {
        console.log("Deleted database successfully");
    };
    req.onerror = function () {
        console.log("Couldn't delete database");
    };
    req.onblocked = function () {
        console.log("Couldn't delete database due to the operation being blocked");
    };
    req2.onsuccess = function () {
        console.log("Deleted database successfully");
    };
    req2.onerror = function () {
        console.log("Couldn't delete database");
    };
    req2.onblocked = function () {
        console.log("Couldn't delete database due to the operation being blocked");
    };
}
window.Remove=Remove;

async function changeImg(imgurl,room,name) {
    socket.emit('create or join', room, name);
    hideLoginInterface(87987894984945461681819197, name);
    Remove();
    socket.emit('create or join', room, name);
}
window.changeImg=changeImg;