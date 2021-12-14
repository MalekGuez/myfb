<?php			
$config = array() ;

// Connection a la base de donnee
$config["myfb"]["db_host"] = "localhost" ;
$config["myfb"]["db_usr"] = "root" ;
$config["myfb"]["db_pwd"] = "" ;
$config["myfb"]["db_connectstring"] = null ;

$_ENV["config"] = $config ;

function decodeStr( $str )
{
    return utf8_decode($str) ;
}

function encodeStr( $str )
{
    return utf8_encode($str) ;
}

?>

