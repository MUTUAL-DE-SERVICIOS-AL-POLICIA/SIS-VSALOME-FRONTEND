<template>
  <v-layout align-center justify-center>
    <v-flex xs12 sm8 md6 lg5 xl4>
      <v-card>
        <v-toolbar flat color="primary">
          <v-icon>mdi-account</v-icon>
          <v-toolbar-title class="font-weight-light" >
            Acceso
          </v-toolbar-title>
        </v-toolbar>
        <v-spacer></v-spacer>
        <v-card-text>
            <v-text-field v-model="user_name"
              autofocus
              label="Usuario"
              required
            ></v-text-field>
            <v-text-field v-model="password"
              type="password"
              label="Contraseña"
              required
            ></v-text-field>
            <v-flex class="red--text" v-if="error_login">
              {{error_login}}
            </v-flex>
        </v-card-text>
        <v-spacer></v-spacer>
        <v-card-actions class="px-3 pb-3">
          <v-flex text-xs-right text-center>
            <v-btn @click="enter()" color="primary">Ingresar</v-btn>
          </v-flex>
        </v-card-actions>
        
      </v-card>
    </v-flex>
  </v-layout>
</template>

<script>
import axios from 'axios';
export default {
  data (){
    return{
      user_name:'',
      password:'',
      error_login:null
    }
  },
  methods:{
    enter(){
      axios.post('user/login', {user_name: this.user_name, password: this.password})
          .then(respuesta => { 
            return respuesta.data;
          })
          .then(data => { 
            this.$store.dispatch("saveToken",data.tokenReturn)
            this.$router.push({name:"Home"})
          })
          .catch(error => {
            this.error_login = null;
            console.log(error)
            if (error.response.status == 404) {
              this.error_login = 'No existe el usuario';
            }else{
              this.error_login = 'Credenciales incorrectas';
            }
          });
    }
  }
}
</script>