
Vue.component( "vw-fil-actualite",{
    props:["messages","connexion","texte","db"],
    template:`
        <div>
            <div 
                v-for="message in messages"
                v-bind:message="message">
                <span><strong>{{message.prenom}} {{message.nom}}</strong> {{message.texte}}</span> 
            </div>
            <br>
            <div>
                <label>Message:</label>
                <input type="text" size="80" v-model="texte">
                <button v-on:click="onSendMessage()">Envoyer</button>
            </div>
        </div>
    `,
    methods:{
        onSendMessage: async function()
        {
            // Recupère la date et l'heure du moment au bon format
            var maintenant = new Date(Date.now()) ;
            var dateStr = maintenant.getFullYear() + "-" ;
            dateStr += ( maintenant.getMonth()+1 < 10 )? "0" + (maintenant.getMonth()+1): maintenant.getMonth()+1 ; 
            dateStr += "-" + maintenant.getDate() + " " ;
            dateStr += maintenant.getHours() + ":" + maintenant.getUTCMinutes() + ":" + maintenant.getSeconds() ;

            // Construit le nouvel enregistrement
            var data = {
                id: this.messages.length+1,
                idUser: this.connexion.id,
                dateEdition: dateStr,
                texte: this.texte
            }

            this.db.insert( "messages", data ) ;
        }
    }
}) ;