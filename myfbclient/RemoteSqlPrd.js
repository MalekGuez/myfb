/***********************************************************************************************
 * @name remotesqlprd
 * @description
 * AngularJS service to acces to remote database
 * using sqlexec.php WEB service
 * @version 1.0
 * @author Axel Rinaldi 01/04/2016
 ***********************************************************************************************/
//import {SqlPrd} from "./SqlPrd.js"

/*
 * @class Class RemoteSqlPrd: provider pour acceder à WebSqlPrd
 * @constructor
 * @param {string} remoteDbUrl URL of WebService to access to database 
 * @param {string} remoteScript Name of script to exec for WebService
 * @param {string} dbName Name of the database
 * @param {number} dbId id for the database 
 * @param {string} requestType request type: GET or POST 
 *                          
 */
function RemoteSqlPrd( remoteDbUrl, dbName, requestType="GET", dbId=0, remoteScript=null )
{
    // Enregistre les données de configuration
    this.remoteDbUrl = remoteDbUrl ;
    this.requestType = requestType ;
    if( remoteScript ) this.remoteScript = remoteScript ;
    else this.remoteScript = "sqlexec.php" ;
    this.dbName = dbName ;
    if( dbId ) this.dbId = dbId ;
    else this.dbId = "" ;
}

// La classe RemoteSqlPrd heritage de la classe SqlPrd
RemoteSqlPrd.prototype = new SqlPrd ;

/**
 * @ngdoc methode
* @name createGetUrl
* @param {string} sql SQL request
* @param {array} pk Array of field names of primary key
* @return {array} array object with values
* @return {object} return a promise
* @description
* Génère et retourne l'URL à envoyer au WEB service avec la methode GET
*/

RemoteSqlPrd.prototype.createGetUrl = function( sql, pk, values, fields=null )
{
    // Recupere le type de requete SELECT, UPDATE, DELETE ou INSERT
    
    if( this.remoteDbUrl )  var url = this.remoteDbUrl + "/" + this.remoteScript + "?dbname=" + this.dbName + "&dbid=" + this.dbId + "&sql=" + sql ;
    else  var url = this.remoteScript + "?dbname=" + this.dbName + "&dbid=" + this.dbId + "&sql=" + sql ;
    
    var sqlType = this.getTypeOfSqlStatement( sql ) ;
    var value ;
    var first = true ;
    
    // Ajoute dans l'URL les valeurs des attributs de l'objet reférencé par values sous forme d'argument
    if( values && ( sqlType == this.SELECT || sqlType == this.UPDATE || sqlType == this.INSERT ) )
    {
        if( fields )
        {
            if( first ) url += "&fields=" ;
            for( let i=0 ; i<fields.length ; i++ )        
            {
                if( values[fields[i]] )
                {
                    value = values[fields[i]] ;

                    // Remplace les caractères qui posent problème dans l'URL
                    if( typeof value == "string" )
                    {
                        value = value.replace( /&/g, "<etcom>") ;
                        value = value.replace( /,/g, "<virg>") ;
                        value = value.replace( /#/g, "<dieze>") ;
                    }
                    if( first ) url += value ; 
                    else url += "," + value ; 
                    first = false ;
                }
                else
                {
                    if( first ) url += "null" ; 
                    else url += "," + "null" ; 
                    first = false ;            
                }
            }
        }
        else
        {
            if( first ) url += "&valueStr=[" ;
            for( var fieldName in values )        
            {
                if( fieldName.indexOf( "$$") == -1 )
                {
                    if( values[fieldName] )
                    {
                        value = values[fieldName] ;

                        // Remplace les caractères qui posent problème dans l'URL
                        if( typeof value == "string" )
                        {
                            value = value.replace( /&/g, "<etcom>") ;
                            value = value.replace( /,/g, "<virg>") ;
                            value = value.replace( /#/g, "<dieze>") ;
                        }
                        if( first ) url += "\"" + value + "\"" ; 
                        else url += "," + "\"" + value + "\"" ; 
                        first = false ;
                    }
                    else
                    {
                        if( first ) url += "null" ; 
                        else url += "," + "null" ; 
                        first = false ;            
                    }
                }
            }
            url += "]" ;
        }
    }

        
    // Ajoute sous forme d'argument dans l'URL les valeurs des attributs de l'objet reférencé par values 
    // qui sont mentionnés par le tableau pk
    if( pk && ( sqlType == this.DELETE || sqlType == this.UPDATE ) )
    {
        if( first ) url += "&fields=" ;
        
        for( var i=0 ; i<pk.length ; i++ )
        {
            if( values[pk[i]] )
            {
                value = values[pk[i]] ;

                // Remplace le caractères qui posent problème dans l'URL
                if( typeof value == "string" )
                {
                    value = value.replace( /&/g, "<etcom>") ;
                    value = value.replace( /,/g, "<virg>") ;
                    value = value.replace( /#/g, "<dieze>") ;
                }
                if( first ) url += value ; 
                else url += "," + value ; 
                first = false ;
            }
            else
            {
                if( first ) url += "null" ; 
                else url += "," + "null" ; 
                first = false ;            
            }
        }           
    }
    return url ;
}

/**
 * @ngdoc methode
* @name createPostUrl
* @param {string} sql SQL request
* @param {array} pk Array of field names of primary key
* @return {array} array object with values
* @return {object} return a promise
* @description
* Génère et retourne l'URL à envoyer au WEB service avec la methode POST
*/

RemoteSqlPrd.prototype.createPostUrl = function( sql, pk, values )
{
    return this.remoteDbUrl + "/" + this.remoteScript ;
};

/**
 * @ngdoc methode
 * @name createPostData
 * @param {string} sql SQL request
 * @param {array} pk Array of field names of primary key
 * @return {array} array object with values
 * @return {array} array object with new values, if null values array is used
 * @return {object} return a promise
 * @description
 * Génère et retourne l'objet de donnée à envoyer au WEB service avec la methode POST
 */

RemoteSqlPrd.prototype.createPostData = function( sql, pk, values, pkvalues=null, fields=null, lineOffset=0, nbLines=99999999, rowNumFilter="" )
{
    // Recupere le type de requete SELECT, UPDATE, DELETE ou INSERT

    let data = {
        dbname: this.dbName,
        dbid: this.dbId,
        sql: sql,
        lineoffset: lineOffset,
        nblines: nbLines,
        valueStr: "",
        rowNumFilter: rowNumFilter,
        pkStr:""
    };

    const regexRC = /\n/g ;
        
    let sqlType = this.getTypeOfSqlStatement( sql ) ;

    // Ajoute dans l'attribut fields les valeurs des attributs de l'objet reférencé par values sous forme d'argument
    if( values && ( sqlType == SqlPrd.prototype.SELECT 
    || sqlType == SqlPrd.prototype.UPDATE 
    || sqlType == SqlPrd.prototype.INSERT ) )
    {
        let dd = {} ;

        if( fields )
        {
            for( let i=0 ; i<fields.length; i++ )        
            {
                let fieldName = fields[i] ;
                if( typeof values[fieldName] == "boolean" && (values[fieldName] == false || !values[fieldName]) ) dd[fieldName] = 0 ;
                else if( values[fieldName] ) dd[fieldName] = 0 ;
                else dd[fieldName] = "null" ;
                if( typeof dd[fieldName] == "string" ) dd[fieldName] = dd[fieldName].replaceAll( regexRC, "<#RC#>") ;
            }
        }
        else
        {
            for( let fieldName in values )        
            {
                if( fieldName[0] != "$" && typeof values[fieldName] != "function" )
                {
                    if( typeof values[fieldName] == "boolean" && (values[fieldName] == false || !values[fieldName]) ) dd[fieldName] = 0 ;
                    else if( values[fieldName] ) dd[fieldName] = values[fieldName] ;
                    else dd[fieldName] = "null" ;
                    if( typeof dd[fieldName] == "string" ) dd[fieldName] = dd[fieldName].replaceAll( regexRC, "<#RC#>") ;
                }
            }
        }
        data.valueStr = JSON.stringify( dd ) ;
    }

    // Ajoute sous forme d'argument dans l'attribut fields les valeurs des attributs de l'objet reférencé par values 
    // qui sont mentionnés par le tableau pk
    if( pk && ( sqlType == SqlPrd.prototype.DELETE 
        || sqlType == SqlPrd.prototype.SELECT
        || sqlType == SqlPrd.prototype.UPDATE ) )
    {
        let dd = {} ;

        if( pkvalues )
        {
            for( let i=0 ; i<pk.length ; i++ )
            {
                if( pkvalues[pk[i]] ) dd[pk[i]] = pkvalues[pk[i]] ;
                else dd[pk[i]] = "null" ;
            }
        }
        else
        {
            for( let i=0 ; i<pk.length ; i++ )
            {
                if( values[pk[i]] ) dd[pk[i]] = values[pk[i]] ;
                else dd[pk[i]] = "null" ;
            }
        }           
        data.pkStr = JSON.stringify( dd ) ;
    }
    return data ;
} ;

RemoteSqlPrd.prototype.sendRequest = function( url, data=null ) 
{
    return new Promise((resolve,reject) =>
    {
        var xhr = new XMLHttpRequest();
        xhr.open( this.requestType, url ) ;
        
        xhr.onload = function() 
        {
            // Receve data answer
            var r  ;
            try
            {
                var str = xhr.responseText.replace( /\r/g,'') ;
                str = str.replace( /\\"/g,'') ;
                str = str.replace( /\\/g,'') ;
                str = str.replace( /\n/g,'') ;
                r = JSON.parse( str ) ;
                resolve( r ) ;
            }
            catch( err )
            {
                reject("Parsing error:" + err.message + " dans " + xhr.responseText ) ; 
            }
        };
        
        xhr.onerror = function() 
        {
            reject("Error:" + " dans " + xhr.responseText ) ; 
        };
        
        if( this.requestType == "POST" )
        {
            // Send via POST method
            var formData = new FormData();
            
            for( var attr in data )
            {
                formData.append( attr, data[attr] );
            }

            xhr.send(formData);
        }
        else
        {
            // Send via GET method
            xhr.send() ;
        }
    }) ;            
} ;

/**
 * @ngdoc method
* @name createTable
* @param {string} tableName SQL name of the table
* @param {object} fields Object witch each attribute is a table's field. 
* @return {object} return a promise
* @description
* Create a new table if not exist
*/
RemoteSqlPrd.prototype.createTable = function( tableName, fields )
{
    var sql = this.createSqlCreateTableStatement( tableName, fields ) ;
    var url = this.createPostUrl( sql, null, null ) ;
    var data = this.createPostData( sql, null, null ) ;
    
    // Envoie la requete vers le serveur WEB
    return this.sendPostRequest( url, data ).then(function(response)
    {   if( response.data.sql )
        {
            response.data.url = url ;
            return response.data ;
        }
        else
        {
            alert( response.data.error ) ;
        }
    },function(error)
    {
        console.error( "RemoteSqlPrd.prototype.createTable: " + error.message + " on URL: " + url ) ;
    });
} ;

/**
 * @ngdoc method
* @name exec
* @param {string} sql SQL request
* @param {array} bindings Array of values for bindings
* @return {object} return a promise
* @description
* Execute a SQL request and return the result as an array of objects
*/

RemoteSqlPrd.prototype.exec = function( sql, values, pkvalues=null, fields=null )
{
    var url = this.createPostUrl( sql, null, values ) ;
    var data = this.createPostData( sql, null, values, pkvalues, fields ) ;
    
    // Envoie la requete vers le serveur WEB
    return this.sendPostRequest( url, data ).then(function(results)
    {
        if( results.sql )
        {
            results.url = url ;
            return results ;
        }
        else alert( "RemoteSqlPrd.prototype.exec: " + results.data.error + " dans la requete: " + results.data.sql ) ;
    },function(error)
    {
        console.error( "RemoteSqlPrd.prototype.exec: " + error.message + " on URL: " + url ) ;
    });
};

/**
 * @ngdoc method
* @name select
* @param {string} sql SQL request
* @param {array} bindings Array of values for bindings
* @param {array} array populated with rows. Each row contain an objet with valuated attributes for each field in SQL select
* @param {number} offset num of first row
* @param {number} nblines number of row
* @return {object} return a promise
* @description
* Execute a SQL request and return the result as an array of objects
*/

RemoteSqlPrd.prototype.select = function( sql, values, array=null, offset=0, nblines=999999, rowNumFilter="" )
{
    var url = "" ;
    var data = null ;

    if( this.requestType == "GET" )
    {
        url = this.createGetUrl( sql, null, values ) ;
    }
    else
    {
        url = this.createPostUrl( sql, null, values ) ;
        data = this.createPostData( sql, null, values, null, null, offset, nblines, rowNumFilter ) ;
    }
        
    // Envoie la requete vers le serveur WEB
    return this.sendRequest( url, data ).then( function(results)
    {
        if( results.rows )
        {
            const regexRC = /<#RC#>/ig;

            // Rétabli les retours de ligne
            for (let i = 0; i < results.rows.length; i++) 
            {
                let row = results.rows[i] ;
                for( let field in row )
                {
                    row[field] = row[field].replaceAll( regexRC, "\n" ) ;
                }
            }                                

            if( array ) 
            {
                //Insere les lignes résultats dans le tableau array
                for (let i = 0; i < results.rows.length; i++) 
                {
                    array.push(results.rows[i]) ;
                }                                
                return results ;
            }
            else return results ;
        }
        else alert( "RemoteSqlPrd.prototype.select: " + results.error + " dans la requete: " + results.sql ) ;
    },function(error)
    {
        console.error( "RemoteSqlPrd.prototype.select: " + error + " on URL: " + url ) ;
    });
};

/**
 * @ngdoc method
* @name load
* @param {string} tableName SQL name of the table
* @param {object} row Object witch each attribute content a value for table's field. 
* @param {object} pk array witch each case content field name of primary key. 
* @return {object} return a promise
* @description
* Load one record from it's pk values in row
*/
RemoteSqlPrd.prototype.load = function( tableName, pk, values )
{
    var sql = this.createSqlLoadStatement( tableName, pk ) ;
    var url = this.createPostUrl( sql, null, values ) ;
    var data = this.createPostData( sql, null, values, null, null, 0, 99999, "" ) ;
    
    // Envoie la requete vers le serveur WEB
    return this.sendPostRequest( url, data ).then( function(results)
    {
        const regexRC = /<#RC#>/ig;
        if( results.error ) alert( "RemoteSqlPrd.load: " + results.error + " dans la requete: " + results.sql ) ;
        else if( results.rows && results.rows.length )
        {
            let row = results.rows[0] ;
            for( let field in row )
            {
                row[field] = row[field].replaceAll( regexRC, "\n" ) ;
            }
            return results.rows[0] ;
        } 
        return results ; 
    },function(error)
    {
        console.error( "RemoteSqlPrd.prototype.select: " + error + " on URL: " + url ) ;
    });

};

/**
 * @ngdoc method
* @name update
* @param {string} tableName SQL name of the table
* @param {object} row Object witch each attribute content a value for table's field. 
* @param {object} pk array witch each case content field name of primary key. 
* @return {object} return a promise
* @description
* Update a record
*/
RemoteSqlPrd.prototype.update = function( tableName, pk, values, pkvalues=null, fields=null )
{
    var sql = this.createSqlUpdateStatement( tableName, pk, values, fields ) ;
    var url = this.createPostUrl( sql, pk, values ) ;
    var data = this.createPostData( sql, pk, values, pkvalues, fields ) ;

    // Envoie la requete vers le serveur WEB
    return this.sendPostRequest( url, data ).then(function(response)
    {
        if( response.error )
        {
            console.error( "RemoteSqlPrd.update error " + response.error + " in " + response.sql ) ;
        }
        if( response.sql )
        {
            response.url = url ;
            return response ;
        }
        else alert( "RemoteSqlPrd.prototype.update: " + results.error + " dans la requete: " + results.sql ) ;
    },function(error)
    {
        console.error( "RemoteSqlPrd.prototype.update: " + error.message + " on URL: " + url ) ;
    });
};

/**
 * @ngdoc method
* @name delete
* @param {string} tableName SQL name of the table
* @param {object} row Object witch each attribute content a value for table's field. 
* @param {object} pk array witch each case content field name of primary key. 
* @return {object} return a promise
* @description
* Delete a record
*/
RemoteSqlPrd.prototype.delete = function( tableName, pk, pkvalues )
{
    var sql = this.createSqlDeleteStatement( tableName, pk ) ;
    var url = this.createPostUrl( sql, pk, pkvalues ) ;
    var data = this.createPostData( sql, pk, null, pkvalues ) ;

    // Envoie la requete vers le serveur WEB
    return this.sendPostRequest( url, data ).then(function(response)
    {
        if( response.sql )
        {
            response.url = url ;
            return response ;
        }
        else alert( "RemoteSqlPrd.prototype.delete: " + results.error + " dans la requete: " + results.sql ) ;
    },function(error)
    {
        console.error( "RemoteSqlPrd.prototype.delete: " + error + " on URL: " + url ) ;
    });
};

/**
 * @ngdoc method
* @name insert
* @param {string} tableName SQL name of the table
* @param {object} row Object witch each attribute content a value for table's field. 
* @return {object} return a promise
* @description
* Insert a new record
*/
RemoteSqlPrd.prototype.insert = function( tableName, values, fields=null )
{
    var url = "" ;
    var data = "" ;
    var sql = this.createSqlInsertStatement( tableName, values, fields ) ;

    if( this.requestType == "GET" )
    {
        url = this.createGetUrl( sql, null, values ) ;
    }
    else
    {
        url = this.createPostUrl( sql, null, values ) ;
        data = this.createPostData( sql, null, values, null, null, offset, nblines, rowNumFilter ) ;
    }
            
    // Envoie la requete vers le serveur WEB
    return this.sendRequest( url, data ).then(function(response)
    {
        if( response.error )
        {
            throw "RemoteSqlPrd.insert: " + response.error + " in sql " + sql ;
        }
        else
        {
            response.url = url ;
            return response ;
        }
    },function(error)
    {
        throw "RemoteSqlPrd.insert: " + response.error + " in sql " + sql ;
    });
};

