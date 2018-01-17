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

/**
 * Insert Post to posts table in databse
 * @param {Object} dataObj 
 * @return {Promise} postId
 */
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

/**
 * Insert Post and Category to post_category table in database
 * @param {int} postId 
 * @param {int} cateId 
 */
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

/**
 * Function insert new or get id of tag 
 * @param {sting} tag 
 */
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
/**
 * insert array tags to tag table in databse
 * @param {array} tags 
 */
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

/**
 * Insert PostId and tagId into post_tag table
 * @param {int} postId 
 * @param {int} tagIds 
 */
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