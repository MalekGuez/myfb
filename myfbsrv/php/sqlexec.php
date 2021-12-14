<?php
    // Ajout de la directive CORS
    header( "Access-Control-Allow-Origin:*") ;
    
    // Ajout du jeu de caractère UTF-8
    header('Content-Type: text/html; charset=UTF-8') ;

    require_once( "./config.php") ;

    $dbId = "" ;
    if( array_key_exists( "dbid", $_POST ) ) $dbId = $_POST["dbid"] ;
    else if( array_key_exists( "dbid", $_GET ) ) $dbId = $_GET["dbid"] ;
    
    $dbName = "infodoc" ;
    if( array_key_exists( "dbname", $_POST ) ) $dbName = $_POST["dbname"] ;
    else if( array_key_exists( "dbname", $_GET ) ) $dbName = $_GET["dbname"] ;

    $sql = "select * from users" ;
    if( array_key_exists( "sql", $_POST ) ) $sql = $_POST["sql"] ;
    else if( array_key_exists( "sql", $_GET ) ) $sql = $_GET["sql"] ;
    
    $valueStr = "" ;
    $values = null ;
    if( array_key_exists( "valueStr", $_POST ) ) $valueStr = $_POST["valueStr"] ;
    else if( array_key_exists( "valueStr", $_GET ) ) $valueStr = $_GET["valueStr"] ;
    $values = json_decode( $valueStr, true ) ;
    //echo( "valueStr: $valueStr <br>" ) ;
    //echo( "values[0]: $values[0] <br>" ) ;

    $pkStr = "" ;
    $pk = null ;
    if( array_key_exists( "pkStr", $_POST ) ) $pkStr = $_POST["pkStr"] ;
    else if( array_key_exists( "pkStr", $_GET ) ) $pkStr = $_GET["pkStr"] ;
    $pk = json_decode( $pkStr, true ) ;

    $queryid = "" ;
    if( array_key_exists( "queryid", $_POST ) ) $queryid = $_POST["queryid"] ;
    else if( array_key_exists( "queryid", $_GET ) ) $queryid = $_GET["queryid"] ;

    $lineOffset = 0 ;
    if( array_key_exists( "lineoffset", $_POST ) ) $lineOffset = $_POST["lineoffset"] ;
    else if( array_key_exists( "lineoffset", $_GET ) ) $lineOffset = $_GET["lineoffset"] ;

    $nbLines = 999999999 ;
    if( array_key_exists( "nblines", $_POST ) ) $nbLines = $_POST["nblines"] ;
    else if( array_key_exists( "nblines", $_GET ) ) $nbLines = $_GET["nblines"] ;

    $rowNumFilter = "" ;
    if( array_key_exists( "rowNumFilter", $_POST ) ) $rowNumFilter = $_POST["rowNumFilter"] ;
    else if( array_key_exists( "rowNumFilter", $_GET ) ) $rowNumFilter = $_GET["rowNumFilter"] ;
    
    echo "{";

    if( $dbName == "" )
    {
        echo "\"error\":\"Argument dbname non renseigné.\"}" ;
        die();        
    }
    
    
    echo " \"dbName\":\"" . $dbName ;
    echo "\",\"host\":\"" . $config[$dbName]["db_host"] ;
    echo "\",\"user\":\"" . $config[$dbName]["db_usr"] . "\"," ;
    

    $fetching = false ;

    try
    {
        if( $config[$dbName]["db_connectstring"] )
        {
            $db = new PDO( $config[$dbName]["db_connectstring"], $config[$dbName]["db_usr"], $config[$dbName]["db_pwd"] ) ;
        }
        else
        {
            $db = new PDO( 'mysql:host=' . $config[$dbName]["db_host"] . ';dbname=' . $dbName, $config[$dbName]["db_usr"], $config[$dbName]["db_pwd"] );            
        }

        $db->setAttribute( PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION ) ;

        if( $sql != "" )
        {                
            if( strtoupper( substr( $sql, 0, 6) ) == "SELECT" )
            {
                $whereValues = array() ;

                if( $values )
                {
                    foreach($values as $name => $value) 
                    {
                        if( $value != "null" ) array_push( $whereValues, utf8_decode($value) ) ;
                        else array_push( $whereValues, null ) ;
                    }
                }
                //echo "whereValues[0]: $whereValues[0] <br>" ;
                echo "\"sql\":\"" . $sql . "\"";

                $cursor = $db->prepare( decodeStr($sql) );
                if( $cursor->execute( $whereValues ) ) 
                {
                    $firstrow = true ;
                    echo ", \"rows\":[" ;

                    // Fetch jusqu'à l'offset
                    for( $i=0 ; $i<$lineOffset && $cursor->fetch() ; $i++ ) ;

                    $numLine = 0 ;
                    $fetching = true ;

                    if( $rowNumFilter == "" )
                    {
                        while( ($row = $cursor->fetch()) && $numLine < $nbLines  ) 
                        {
                            if( $firstrow ) echo "{" ;
                            else echo ",{" ;

                            $firstfield = true ;

                            foreach( $row as $name=>$value )
                            {
                                if( is_string($value) ) $value = encodeStr($value) ; //Specifique SqlServer

                                $value = str_replace('"', '\"', $value ) ;
                                $value = str_replace('<virg>', ',', $value ) ;
                                $value = str_replace('<dieze>', '#', $value ) ;
                                $value = str_replace('<dblcote>', '\"', $value ) ;
                                $value = str_replace('<cote>', '\'', $value ) ;
                                $value = str_replace('<etcom>', '&', $value ) ;
                                $value = str_replace( chr(0), '0', $value ) ;
                                $value = str_replace( chr(1), '1', $value ) ;
                                $value = str_replace( chr(13), '\n', $value ) ;
                                $value = str_replace( chr(10), '\n', $value ) ;
                                //$value = str_replace( "#RC#", chr(13), $value ) ;

                                //$value = str_replace( chr(92), '/', $value ) ;
                                if( !is_numeric($name) )
                                {
                                    if( $firstfield ) echo "\"$name\":\"$value\"" ;
                                    else echo ",\"$name\":\"$value\"" ;
                                    $firstfield = false ;
                                }
                            }
                            echo "}" ;
                            
                            $firstrow = false ;
                            $numLine++ ;                        
                        }
                    }
                    else
                    {
                        // Recupere le n° de la première correspondant au filtre
                        $rowNumFilter = str_replace( " ", "", $rowNumFilter ) ;
                        $rowNumFilter = str_replace( "%", "", $rowNumFilter ) ;
                        $rowNumFilter = str_replace( "'", "", $rowNumFilter ) ;
                        $rowNumFilter = str_replace( "like", "|", $rowNumFilter ) ;

                        $filterFields = explode( "|", $rowNumFilter ) ;

                        while( ($row = $cursor->fetch()) ) 
                        {
                            if( strpos( $row[$filterFields[0]], $filterFields[1]) === 0 )
                            {
                                $numLine++ ;
                                echo( "{\"row_num\":\"" . $numLine . "\"}") ;
                                break ;
                            }
                            $numLine++ ;
                        }
                    }
                    echo "],\"error\":null}" ;
                    $fetching = false ;
                }
            }
            else
            {
                $whereValues = array() ;

                foreach($values as $name => $value) 
                {
                    //$value = str_replace( "\n", "#RC#", $value ) ;
                    if( $value != "null" ) array_push( $whereValues, decodeStr($value) ) ;
                    else array_push( $whereValues, null ) ;
                }

                if( $pk )
                {
                    foreach($pk as $name => $value) 
                    {
                        if( $value != "null" ) array_push( $whereValues, decodeStr($value) ) ;
                        else array_push( $whereValues, null ) ;
                    }
                }

                echo "\"sql\":\"$sql\"" ;
                $db->beginTransaction() ;
                $cursor = $db->prepare( $sql );
                $cursor->execute( $whereValues ) ;
                $db->commit() ;
                unset( $cursor ) ;

                // test
                ////$db->beginTransaction() ;
                //$db->exec( "insert into EquipementTypes( id, libelle ) values( 999,'test')" ) ;
                //$db->commit() ;
                
                // Log transaction
                if( $dbId != "" && $dbId != "0" )
                {
                    $v = array( "$dbId", "$sql", "$fields") ;
                    //$db->beginTransaction() ;
                    $cursor = $db->prepare( "insert into reptransactions(dbid,sqlstr,valuesstr) values(?,?,?)") ;
                    $cursor->execute( $v ) ;
                    //$db->commit() ;
                }

                echo ",\"error\":null}" ;
            }
        }
        else 
        {
            echo ",\"error\":\"argument sql non renseigne.\"}" ;
        }
    }
    catch (PDOException $e) 
    {
        $msg = $e->getMessage() ;
        //if( strpos( $msg, "SQLSTATE[23000]" ) >= 0 ) $msg = "SQLERR01: Enregistrement déjà existant" ;
        if( $fetching ) echo "],\"error\":\"". $msg . " in " . $sql . "\"}" ;        
        else echo ",\"error\":\"". $msg . " in " . $sql . "\"}" ;        
        die();
    }    
?>

