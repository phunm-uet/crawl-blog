var conn = require('./connection')
/**
 * Function save Data crawl to Database
 * @param {Object} dataObj 
 * @param {int} cateId 
 */
var insertDB = async function(dataObj,cateId){
    try {
        var postId = await insertPost(dataObj)
        await insertPostCate(postId,cateId)    
        let tags = await insertTags(dataObj.tags)
        insertPostTag(postId,tags)
    } catch (error) {
        console.log(error)
    }
}

var insertPost = function(dataObj){
    return new Promise((resolve,reject) => {
        conn('posts')
        .returning('id')
        .insert({
            name : dataObj.title || "Unknow",
            slug : dataObj.slug,
            description : dataObj.description,
            content : dataObj.body,
            status : 0,
            user_id : 1,
            featured : 0,
            image : dataObj.filePath
        })
        .then(id => { return resolve(id)})
        .catch(err => {return reject(err.sqlMessage)})        
    })
}

var insertPostCate = function(postId,cateId){
    return new Promise((resolve ,reject) => {
        conn('post_category')
        .insert({
            post_id : postId,
            category_id : cateId
        })
        .then(() => {return resolve("OK")})
        .catch((err) => {return reject(err.sqlMessage)})
    })
}

var insertTag = function(tag){
    return new Promise((resolve,reject) => {
        conn('tags')
        .where('slug','=',tag.slug)
        .then(rows => {
            if(rows.length > 0){
                return resolve(rows[0].id)
            }else {
                conn('tags')
                .returning('id')
                .insert({
                    name : tag.name,
                    slug : tag.slug,
                    user_id : tag.user_id
                })
                .then(id => {
                    return resolve(id)
                })
                .catch(err => {return reject(err.sqlMessage)})                
            }
        })
    })
}
var insertTags = function(tags){
    var tagIds = []
    return new Promise((resolve,reject) => {
        var promises = tags.map(insertTag)
        var result = Promise.all(promises)
        result.then((tagIds) => {
           return resolve(tagIds)
        })
        .catch(err => {return reject(err)})
    })
}

var insertPostTag = function(postId,tagIds){
    let postTag = []
    for(i = 0 ; i < tagIds.length ; i++){
        postTag.push({tag_id : tagIds[i],post_id : postId})
    }
    conn('post_tag')
    .insert(postTag)
    .catch(err => {console.log(err.sqlMessage)})
}
module.exports = insertDB