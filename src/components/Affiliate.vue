<template>
  <v-layout align-start>
    <v-flex>
      <v-data-table
        :headers="headers"
        :items="affiliates"
        :search="search"
        sort-by="calories"
        class="elevation-1"
        :items-per-page="100"
        hide-default-footer
      >
        <template v-slot:top>
          <v-toolbar flat>
            <v-toolbar-title>Afiliados</v-toolbar-title>
            <v-divider class="mx-4" inset vertical></v-divider>
            <v-spacer></v-spacer>
            <v-text-field
              class="text-xs-left"
              v-model="search"
              append-icon="search"
              label="Búsqueda"
              single-line
              hide-details
            ></v-text-field>

            <v-dialog v-model="dialog" max-width="700px">
              <v-card>
                <v-card-title>
                  <span class="headline">{{ formTitle }}</span>
                </v-card-title>

                <v-card-text>
                  <v-container>
                    <v-row>

                      <v-col cols="12" sm="6" md="12">
                        <v-text-field
                          v-model="identity_card"
                          label="Carnet de Identidad"
                        ></v-text-field>
                      </v-col>
                      <v-col cols="12" sm="6" md="12">
                        <v-text-field
                          v-model="name"
                          label="Nombres"
                        ></v-text-field>
                      </v-col>
                      <v-col cols="12" sm="6" md="12">
                        <v-text-field
                          v-model="last_name"
                          label="Apellido Paterno"
                        ></v-text-field>
                      </v-col>
                      <v-col cols="12" sm="6" md="12">
                        <v-text-field
                          v-model="mothers_last_name"
                          label="Apelido Materno"
                        ></v-text-field>
                      </v-col>
                      <v-col cols="12" sm="6" md="12">
                        <v-text-field
                          v-model="surname_husband"
                          label="Apellido de Casada"
                        ></v-text-field>
                      </v-col>

                      <v-col cols="12" sm="6" md="12" v-show="valid">
                        <div class="red--text" v-for="v in validationMessage" :key="v" v-text="v"></div>
                      </v-col>
                    </v-row>
                  </v-container>
                </v-card-text>

                <v-card-actions>
                  <v-spacer></v-spacer>
                  <v-btn color="blue darken-1" text @click="close">
                    Cancelar
                  </v-btn>
                  <v-btn color="blue darken-1" text @click="save">
                    Guardar
                  </v-btn>
                </v-card-actions>
              </v-card>
            </v-dialog>

          </v-toolbar>
        </template>
        <template v-slot:[`item.actions`]="{ item }">
          <v-icon class="mr-2" @click="editItem(item)">
            mdi-pencil
          </v-icon>
        </template>
        <template v-slot:no-data>
          <v-btn color="primary" @click="toList()"> Actualizar </v-btn>
        </template>
      </v-data-table>
    </v-flex>
  </v-layout>
</template>

<script>
import axios from "axios";
export default {
  data() {
    return {
      dialog: false,
      search: "",
      affiliates: [],
      headers: [
        { text: "Carnet de Identidad", value: "identity_card" },
        { text: "Nombres", value: "name" },
        { text: "Apellido Paterno", value: "last_name" },
        { text: "Apelido Materno", value: "mothers_last_name" },
        { text: "Apellido de Casada", value: "surname_husband" },
        { text: "Opciones", value: "actions", sortable: false },
      ],
      editedIndex: -1,
      _id:'',
      name: '',
      last_name: '',
      mothers_last_name: '',
      surname_husband: '',
      identity_card: '',
      valid:0,
      validationMessage:[],

    };
  },
  computed: {
    formTitle() {
      return "Editar Afiliado";
    },
  },

  watch: {
    dialog(val) {
      val || this.close();
    },
  },

  created() {
    this.toList();
  },

  methods: {

    toList() {
      let me = this;
      let header = {"token": this.$store.state.token}
      let config = {headers: header}
      axios
        .get("affiliate/list", config)
        .then(function (response) {
          me.affiliates = response.data;
        })
        .catch(function (error) {
          console.log(error);
        });
    },

    validate () {
      this.valid = 0;
      this.validationMessage= [];
      if(this.name.length<1 || this.name.length>50){
        this.validationMessage.push('N Debe ser entre 1-50 caracteres.');
      }

      if (this.validationMessage.length){
        this.valid = 1;
      }
      return this.valid;
    },

    save() {
      let me = this;
      let header = {"token": this.$store.state.token}
      let config = {headers: header}
      if (this.validate()){
        return;
      }
      if (this.editedIndex > -1) {
        axios.put('affiliate/update',{'_id':this._id,'name':this.name,'last_name':this.last_name,'mothers_last_name':this.mothers_last_name, 'surname_husband':this.surname_husband, 'identity_card':this.identity_card}, config)
          .then(function(response){
            me.clear();
            me.close();
            me.toList();
          })
          .catch(function(error){
            console.log(error);
          });
      } else {
        //
      }
      this.close();
    },

    editItem(item) {
      this._id=item._id;
      this.name=item.name;
      this.last_name=item.last_name;
      this.mothers_last_name=item.mothers_last_name;
      this.surname_husband=item.surname_husband;
      this.identity_card=item.identity_card;
      this.editedIndex=1;
      this.dialog = true;
    },

    clear() {
      this._id ='';
      this.name ='';
      this.last_name ='';
      this.mothers_last_name ='';
      this.surname_husband ='';
      this.identity_card ='';
      this.valid ='';
      this.validationMessage =[];
      this.editedIndex=-1;
    },

    close() {
      this.dialog = false;
    },
  },
};
</script>