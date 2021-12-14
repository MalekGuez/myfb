//import {RemoteSqlPrd} from "./RemoteSqlPrd.js"

Vue.component( "message",{
    props:["message"],
    template: "<span>{{message.nom}} {{message.texte}}</span>"
});


var app = new Vue({
    el: '#app',
    data: {
        nav:{
            views:[
                {
                    nom:"connexion", 
                    titre: "Connexion"
                },
                {
                    nom:"fil", 
                    titre: "Fil d'actualités"
                },
                {
                    nom:"compte", 
                    titre: "Créer un compte"
                }
            ],
            currentViewId: 1
        },
        connexion:
        {
            id: null,
            nom: "",
            prenom: "",
            compte: "",
            mdp:""
        },
        texte: "",
        messages: [],
        db: new RemoteSqlPrd( "http://localhost/MyFB/myfbsrv/php", "myfb", "GET" )
    },
    methods: {
        // Charge l'ensemble des messages
        onLoadMessages: async function()
        {
            var data = await this.db.select( "select count(*) as nb from messages") ;

            if( data.rows[0].nb > this.messages.length )
            {
                var sql = `select 
                    u.prenom as prenom,
                    u.nom as nom,
                    m.texte as texte
                    from messages as m inner join users as u on u.id = m.idUser` 
                data = await this.db.select( sql, [] ) ;

                this.messages = data.rows ;
            }
        }
    },
    created: function()
    {
        var $this = this ;

        // Affiche vue vw-connexion dans 200 ms
        setTimeout( function()
        {
            $this.nav.currentViewId = 0 ;
        }, 200 ) ;            

        // Rafraichi la liste des messages toute les secondes.
        setInterval( function()
        {
            $this.onLoadMessages() ;
        }, 1000 )
    }
}) ;
