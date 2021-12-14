/***********************************************************************************************
 * @name sqlprd
 * @description
 * AngularJS service and factory SQL statement
 * @version 1.0
 * @author Axel Rinaldi 01/04/2016
 ***********************************************************************************************/
 
/**
 * 
 * @class SqlPrd
 * @constructor
 * @description Classe mère pour un fournisseur d'acces SQL
 */
function SqlPrd()
{   
}

/**
 * @name Constantes
 * @description Quelques constantes de classe pour identifier le type d'une 
 * transaction SQL
 */
SqlPrd.prototype.SELECT = 1 ;
SqlPrd.prototype.INSERT = 2 ;
SqlPrd.prototype.UPDATE = 3 ;
SqlPrd.prototype.DELETE = 4 ;

/**
 * @name getTypeOfSqlStatement
 * @param {string} sql: SQL statement
 * @returns {int} Type de la requête 1 : SELECT, 2: INSERT, 3: UPDATE ou 4: DELETE.
 */
SqlPrd.prototype.getTypeOfSqlStatement = function( sql )
{
    if( sql.indexOf( "INSERT") >= 0 ) return SqlPrd.prototype.INSERT ;
    if( sql.indexOf( "UPDATE") >= 0 ) return SqlPrd.prototype.UPDATE ;
    if( sql.indexOf( "DELETE") >= 0 ) return SqlPrd.prototype.DELETE ;
    return SqlPrd.prototype.SELECT ;
} ;

/**
 * @name createSqlWhereStatement
 * @param {array} pk: array of field name of primary key
 * @returns {String} WHERE SQL statement for primary condition
 * @description Crée et renvoie une chaine de caractère contenant la clause
 * WHERE d'une requete SQL construite à partir du tableau référencé par 
 * l'argument pk. Ce dernier contient la liste des champs constituant la clé
 * primaire. La chaine de caractère générée est de la forme:
 * WHERE champ1=? and champ2=?
 * Les caractères ? font référence au data-binding SQL
 * dont les valeurs sont transmises dans un tableau
 */
SqlPrd.prototype.createSqlWhereStatement = function( pk )
{
    var sql = " WHERE " ;

    // Liste des champs de la cle primaire
    let first = true ;
    for( var i=0 ; i<pk.length ; i++ )
    {
        if( first )
        {
            sql += pk[i] + "=?"
            first = false ;
        }
        else sql += " AND " + pk[i] + "=?" ;
    }
    return sql ;
};

/**
 * @name createSqlLoadStatement
 * @param {string} tableName: name of table to update
 * @param {array} pk: array of field name of primary key
 * @returns {String} SELECT SQL statement 
 * @description Crée et renvoie une chaine de caractère contenant une
 * requete SQL de type SELECT sur la table dont le nom est donné par tableName.
 * La requete charge l'enregistrement indentifié par pk avec les valeurs
 * contenue dans row.
 * La chaine de caractère générée est de la forme:
 * SELECT * FROM tableName WHERE pk[0]=? and pk[1]=?
 * Les caractères ? font référence au data-binding SQL
 * dont les valeurs sont transmises dans un tableau
 */
SqlPrd.prototype.createSqlLoadStatement = function( tableName, pk )
{
    var sql = "SELECT * FROM " + tableName + " " ;
    sql += this.createSqlWhereStatement( pk ) ;
    return sql ;
};

/**
 * @name createSqlUpdateStatement
 * @param {string} tableName: name of table to update
 * @param {array} pk: array of field name of primary key
 * @param {object} row: object with values
 * @param {array} fields: field name list (if null, use description of row)
 * @returns {String} UPDATE SQL statement 
 * @description Crée et renvoie une chaine de caractère contenant une
 * requete SQL de type UPDATE sur la table dont le nom est donné par tableName.
 * La requete met à jour l'enregistrement indentifié par pk avec les valeurs
 * contenue dans row.
 * La chaine de caractère générée est de la forme:
 * UPDATE tableName SET champ1=?, champ2=? WHERE champ5=? and champ6=?
 * Les caractères ? font référence au data-binding SQL
 * dont les valeurs sont transmises dans un tableau
 */
SqlPrd.prototype.createSqlUpdateStatement = function( tableName, pk, row, fields=null )
{
    var sql = "UPDATE " + tableName + " SET " ;

    // Liste des champs avec valeurs
    var first = true ;

    if( fields )
    {
        for( let i=0 ; i<fields.length; i++ )
        {
            if( first )
            {
                sql += fields[i] + "=?" ;
                first = false ;
            }
            else sql += "," + fields[i] + "=?" ;
        }
    }
    else
    {
        for( var fieldName in row )
        {
            if( fieldName.indexOf( "$$") == -1 && ( !row[fieldName] || typeof( row[fieldName] ) != "object") )
            {
                if( first )
                {
                    sql += fieldName + "=?" ;
                    first = false ;
                }
                else sql += "," + fieldName + "=?" ;
            }
        }
    }
    sql += this.createSqlWhereStatement( pk ) ;

    return sql ;
};

/**
 * @name createSqlDeleteStatement
 * @param {string} tableName: name of table to update
 * @param {array} pk: array of field name of primary key
 * @param {object} row: object with values
 * @returns {String} DELETE SQL statement 
 * @description Crée et renvoie une chaine de caractère contenant une
 * requete SQL de type DELETE sur la table dont le nom est donné par tableName.
 * La requete supprime l'enregistrement indentifié par pk avec les valeurs
 * contenue dans row.
 * La chaine de caractère générée est de la forme:
 * DELETE FROM tableName WHERE champ1=? and champ2=?
 * Les caractères ? font référence au data-binding SQL
 * dont les valeurs sont transmises dans un tableau
 */
SqlPrd.prototype.createSqlDeleteStatement = function( tableName, pk, row )
{
    var sql = "DELETE FROM " + tableName + this.createSqlWhereStatement( pk ) ;
    return sql ;
};

/**
 * @name createSqlInsertStatement
 * @param {string} tableName: name of table to update
 * @param {object} row: object with values
 * @returns {String} INSERT SQL statement 
 * @description Crée et renvoie une chaine de caractère contenant une
 * requete SQL de type INSERT sur la table dont le nom est donné par tableName.
 * La requete un nouvel enregistrement avec les valeurs contenue dans row.
 * La chaine de caractère générée est de la forme:
 * INSERT INTO tableName(champ1,champ2) VALUES(?,?)
 * Les caractères ? font référence au data-binding SQL
 * dont les valeurs sont transmises dans un tableau
 */
SqlPrd.prototype.createSqlInsertStatement = function( tableName, row, fields=null )
{
    var sql = "INSERT INTO " + tableName + " (" ;

    // Liste des champs
    var first = true ;

    if( fields )
    {
        for( let i=0 ; fields.length ; i++ )
        {
            if( first )
            {
                sql += fields[i] ;
                first = false ;
            }
            else sql += "," + fields[i] ;
        }
    }
    else
    {
        for( var fieldName in row )
        {
            if( fieldName.indexOf( "$$") == -1 && ( typeof( row[fieldName] ) != "object" ||!row[fieldName] ) )
            {
                if( first )
                {
                    sql += fieldName ;
                    first = false ;
                }
                else sql += "," + fieldName ;
            }
        }
    }
    sql += ") VALUES( " ;

    // Liste des ???
    first = true ;

    if( fields )
    {
        for( let i=0 ; i<fields.length ; i++ )
        {
            if( first )
            {
                sql += "?"
                first = false ;
            }
            else sql += ",?" ;
        }
        sql += ")" ;
    }
    else
    {
        for( var fieldName in row )
        {
            if( fieldName.indexOf( "$$") == -1 && ( typeof( row[fieldName] ) != "object" || !row[fieldName] ) )
            {
                if( first )
                {
                    sql += "?"
                    first = false ;
                }
                else sql += ",?" ;
            }
        }
        sql += ")" ;
    }
    
    return sql ;
};

/**
* @ngdoc method
* @name createSqlCreateTableStatement
* @param {string} tableName SQL name of the table
* @param {object} fields Object witch each attribute is a table's field and value is data type. 
* @return {object} return a promise
* @description Crée et renvoie une chaine de caractère contenant une
* requete SQL de type CREATE TABLE pour créer table dont le nom est donné par tableName.
* avec les champs dont les noms sont donnés par les attributs de l'objet référencé
* par l'argument fields et leurs types par leurs valeurs.
* Exemple: {id: "int", nom: "text", prenom: "text"}
* La chaine de caractère générée est de la forme:
* CREATE TABLE IF NOT EXISTS tableName( champ1 type1, champ2 type2 )
*/
SqlPrd.prototype.createSqlCreateTableStatement = function( tableName, fields )
{
    var sql = "CREATE TABLE IF NOT EXISTS " + tableName + " (" ;

    var first = true ;
    for( var fieldName in fields )
    {
        if( first )
        {
            sql += fieldName + " " + fields[fieldName] ;
            first = false ;
        }
        else sql += "," + fieldName + " " + fields[fieldName] ;
    }
    sql += ")" ;
    
    return sql ;
} ;

/**
  * @ngdoc method
  * @name SqlPrd.exec
  * @param {string} sql SQL request
  * @param {array} sql array of SQL string request
  * @return {object} Return a promise
  * @description
  * Execute a SQL request or a array of SQL request
  */
SqlPrd.prototype.exec = function( sql, bindings )
{
    return null ;
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
SqlPrd.prototype.select = function( sql, bindings, array, offset, nblines )
{            
    return null ;
};

/**
  * @ngdoc method
  * @name createTable
  * @param {string} tableName SQL name of the table
  * @param {object} fields Object witch each attribute is a table's field. 
  * @return {object} return a promise
  * @description
  * Create a new table if not exist
  */
SqlPrd.prototype.createTable = function( tableName, fields )
{
    return null ;
} ;

/**
  * @ngdoc method
  * @name load
  * @param {string} tableName SQL name of the table
  * @param {object} pk array witch each case content field name of primary key. 
  * @param {object} row Object witch each attribute content a value for table's field. 
  * @return {object} return a promise
  * @description
  * Load one record from it's pk values in row
  */
SqlPrd.prototype.load = function( tableName, pk, row, fields=null )
{
    return null ;
} ;

/**
  * @ngdoc method
  * @name insert
  * @param {string} tableName SQL name of the table
  * @param {object} row Object witch each attribute content a value for table's field. 
  * @return {object} return a promise
  * @description
  * Insert a new record
  */
SqlPrd.prototype.insert = function( tableName, row, fields=null )
{
    return null ;
} ;

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
SqlPrd.prototype.update = function( tableName, pk, row, fields=null )
{
    return null ;
} ;

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
SqlPrd.prototype.delete = function( tableName, pk, row )
{
    return null ;
} ;

