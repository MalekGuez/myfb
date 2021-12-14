

Vue.component( "vw-connexion",{
    props:["connexion","db","nav"],
    template:`
        <div>
            <div>
                <label>Compte:</label><input v-model="connexion.compte">
            </div>
            <div>
                <label>Mot de passe:</label><input type="password" v-model="connexion.mdp">
            </div>
            <div>
                <button v-on:click="onConnect">Connecter</button>
                <button v-on:click="onCreerCompte">Créer un compte</button>
            </div>
        </div>
    `,
    methods:{
        onConnect: async function()
        {
            // Envoit la requête de connexion et attend le résultat
            var data = await this.db.select( "select * from users where compte=? and mdp=?", 
                [this.connexion.compte,this.connexion.mdp]) ;

            if( data.rows.length )
            {
                // Authentification réussie: met à jour le modele de données
                this.connexion.id = data.rows[0].id ;
                this.connexion.nom = data.rows[0].nom ;
                this.connexion.prenom = data.rows[0].prenom ;

                // Affiche un message et affiche le fil d'actualité
                alert( "Bonjour " + this.connexion.nom + " " + this.connexion.prenom ) ;
                this.nav.currentViewId = 1 ;
            }
            else
            {
                // Echec d'authentification
                this.connexion.compte = "" ;
                this.connexion.mdp = "" ;
                alert( "Compte inconu ou mot de passe érroné" ) ;
            }
        },
        onCreerCompte()
        {
            // Efface données de connexion
            this.connexion.compte = "" ;
            this.connexion.mdp = "" ;
            this.connexion.nom = "" ;
            this.connexion.prenom = "" ;

            // Affiche vue vw-creer-compte
            this.nav.currentViewId = 2 ;
        }
    }
}) ;