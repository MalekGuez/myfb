Vue.component( "vw-fil-actualite-ligne",{
    props:["message"],
    template: "<span>{{message.prenom}} {{message.prenom}} {{message.texte}}</span>"
});


Vue.component( "vw-creer-compte",{
    props:["connexion","db","nav", "checked"],
    template:`
        <div>
            <div>
                <label>Prenom:</label>
                <input type="text" size="20" v-model="connexion.prenom">
            </div>
            <div>
                <label>Nom:</label>
                <input type="text" size="20" v-model="connexion.nom">
            </div>
            <div>
                <label>Compte:</label>
                <input type="text" size="20" v-model="connexion.compte">
            </div>
            <div>
                <label>Mot de passe:</label>
                <input type="text" size="10" v-model="connexion.mdp">
            </div>
            <div class="checkbox">
                <label><input type="checkbox" v-on:click="onCheckBoxClick()"><span>J'ai bien pris connaissance des recommandations RGPD concernant mes droits et devoirs</span></label>
            </div>
                <button v-on:click="onValider()">Ok</button>
                <button v-on:click="onAnnuler()">Annuler</button>
            </div>
        </div>
    `,
    methods:{
        onValider: async function()
        {
            // Construit un identifiant
            var data = await this.db.select( "select max(id) as lastId from users",[] ) ;
            if( data.rows.length ) id = parseInt( data.rows[0].lastId ) + 1 ;
            else id = 1 ;

            // Construit le nouvel enregistrement
            this.connexion.id = id ;

            if(this.connexion.compte === "" || this.connexion.nom === "" || this.connexion.prenom === "" || this.connexion.mdp === "") {
                alert("Veuillez renseigner tous les champs");
                this.nav.currentViewId = 2 ;
            }
            else if (!this.checked) {
                alert("Veuillez confirmer avoir pris connaissance de vos droits et devoirs.");
            }
            else {
                this.checked = true;
                // SQL insert
                await this.db.insert( "users", this.connexion ) ;
                // Revient vers vw-connexion
                this.nav.currentViewId = 0 ;
            }

        },
        onAnnuler()
        {
            // Revient vers vw-connexion
            this.nav.currentViewId = 0 ;
        },
        onCheckBoxClick()
        {
            if(!this.checked)
                this.checked = true;
            else this.checked = false;
        }
    }
}) ;