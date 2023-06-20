<template>
  <v-layout align-start>
    <v-flex>
      <v-data-table
        :headers="headers"
        :items="users"
        :search="search"
        class="elevation-1"
        :items-per-page="5"
      >
        <template v-slot:top>
          <v-toolbar flat>
            <v-toolbar-title>Usuarios</v-toolbar-title>
            <v-divider class="mx-2" inset vertical></v-divider>
            <v-spacer></v-spacer>
            <v-text-field
              class="text-xs-left"
              v-model="search"
              append-icon="search"
              label="Búsqueda"
              single-line
              hide-details
            ></v-text-field>
            <v-spacer></v-spacer>
            <v-dialog v-model="dialog" max-width="700px">
              <template v-slot:activator="{ on, attrs }">
                <v-btn
                  color="primary"
                  dark
                  class="mb-2"
                  v-bind="attrs"
                  v-on="on"
                >
                  Nuevo
                </v-btn>
              </template>
              <v-card>
                <v-card-title>
                  <span class="headline">{{ formTitle }}</span>
                </v-card-title>
                <v-card-text>
                  <v-container>
                    <v-row>
                      <v-col cols="12" sm="6" md="6">
                        <v-select
                          v-model="role"
                          :items="roles"
                          label="Rol"
                        ></v-select>
                      </v-col>
                      <v-col cols="12" sm="6" md="6">
                        <v-text-field
                          v-model="identity_card"
                          label="Carnet de Identidad"
                        ></v-text-field>
                      </v-col>
                      <v-col cols="12" sm="6" md="6">
                        <v-text-field
                          v-model="name"
                          label="Nombre Completo"
                        ></v-text-field>
                      </v-col>
                      <v-col cols="12" sm="6" md="6">
                        <v-text-field
                          v-model="user_name"
                          label="Usuario"
                        ></v-text-field>
                      </v-col>
                      <v-col cols="12" sm="6" md="6">
                        <v-text-field
                          type="password"
                          v-model="password"
                          label="Contraseña"
                        ></v-text-field>
                      </v-col>
                      <v-col cols="12" sm="6" md="12" v-show="valid">
                        <div
                          class="red--text"
                          v-for="v in validationMessage"
                          :key="v"
                          v-text="v"
                        ></div>
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
            <v-dialog v-model="adModal" max-width="290">
              <v-card>
                <v-card-title class="headline" v-if="adAccion == 1">
                  Activar Usuario
                </v-card-title>
                <v-card-title class="headline" v-if="adAccion == 2">
                  Desactivar Usuario
                </v-card-title>
                <v-card-text>
                  Estás a punto de <span v-if="adAccion == 1">activar </span>
                  <span v-if="adAccion == 2">deactivate </span> el usuario
                  {{ adNombre }}
                </v-card-text>
                <v-card-actions>
                  <v-spacer></v-spacer>
                  <v-btn
                    @click="activateDeactivateClose()"
                    color="green darken-1"
                  >
                    Cancelar
                  </v-btn>
                  <v-btn
                    v-if="adAccion == 1"
                    @click="activate()"
                    color="orange darken-4"
                  >
                    Activar
                  </v-btn>
                  <v-btn
                    v-if="adAccion == 2"
                    @click="deactivate()"
                    color="orange darken-4"
                  >
                    Desactivar
                  </v-btn>
                </v-card-actions>
              </v-card>
            </v-dialog>
          </v-toolbar>
        </template>
        <template v-slot:[`item.status`]="{ item }">
          <div v-if="item.status">
            <span class="blue--text">Activo</span>
          </div>
          <div v-else>
            <span class="red--text">Inactivo</span>
          </div>
        </template>
        <template v-slot:[`item.actions`]="{ item }">
          <v-icon class="mr-2" @click="editItem(item)"> mdi-pencil </v-icon>
          <template v-if="item.status">
            <v-icon @click="activarDesactivarMostrar(2, item)"> block </v-icon>
          </template>
          <template v-else>
            <v-icon @click="activarDesactivarMostrar(1, item)"> check </v-icon>
          </template>
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
      users: [],
      headers: [
        { text: "Rol", value: "role" },
        { text: "Carnet de Identidad", value: "identity_card" },
        { text: " Nombre", value: "name" },
        { text: " Usuario", value: "user_name" },
        { text: "Estado", value: "status" },
        { text: "Opciones", value: "actions", sortable: false },
      ],
      editedIndex: -1,
      _id: "",
      role: "",
      roles: ["admin", "cobranzas"],
      identity_card: "",
      name: "",
      user_name: "",
      password: "",
      valid: 0,
      validationMessage: [],
      adModal: 0,
      adAccion: 0,
      adNombre: "",
      adId: "",
    };
  },
  computed: {
    formTitle() {
      return this.editedIndex === -1 ? "Nuevo registro" : "Editar registro";
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
      let header = { token: this.$store.state.token };
      let config = { headers: header };
      axios
        .get("user/list", config)
        .then(function (response) {
          me.users = response.data;
        })
        .catch(function (error) {
          console.log(error);
        });
    },

    validate() {
      this.valid = 0;
      this.validationMessage = [];
      if (!this.role) {
        this.validationMessage.push("Seleccione un rol");
      }
      if (this.name.length < 1 || this.name.length > 50) {
        this.validationMessage.push("Escriba Carnet de Identidad");
      }
      if (this.name.length < 1 || this.name.length > 50) {
        this.validationMessage.push("Escriba el nombre");
      }
      if (this.user_name.length < 1 || this.user_name.length > 50) {
        this.validationMessage.push("Escriba nombre de usuario");
      }
      if (this.password.length < 1 || this.password.length > 50) {
        this.validationMessage.push("Escriba una contraseña");
      }
      if (this.validationMessage.length) {
        this.valid = 1;
      }
      return this.valid;
    },

    save() {
      let me = this;
      let header = { token: this.$store.state.token };
      let config = { headers: header };
      if (this.validate()) {
        return;
      }
      if (this.editedIndex > -1) {
        axios
          .put(
            "user/update",
            {
              _id: this._id,
              role: this.role,
              identity_card: this.identity_card,
              name: this.name,
              user_name: this.user_name,
              password: this.password,
            },
            config
          )
          .then(function (response) {
            me.clear();
            me.close();
            me.toList();
          })
          .catch(function (error) {
            console.log(error);
          });
      } else {
        axios
          .post(
            "user/add",
            {
              role: this.role,
              identity_card: this.identity_card,
              name: this.name,
              user_name: this.user_name,
              password: this.password,
            },
            config
          )
          .then(function (response) {
            me.clear();
            me.close();
            me.toList();
          })
          .catch(function (error) {
            console.log(error);
          });
      }
      this.close();
    },

    editItem(item) {
      this._id = item._id;
      this.role = item.role;
      this.identity_card = item.identity_card;
      this.name = item.name;
      this.user_name = item.user_name;
      this.editedIndex = 1;
      this.dialog = true;
    },
    activarDesactivarMostrar(accion, item) {
      this.adModal = 1;
      this.adNombre = item.name;
      this.adId = item._id;
      if (accion == 1) {
        this.adAccion = 1;
      } else if (accion == 2) {
        this.adAccion = 2;
      } else {
        this.adModal = 0;
      }
    },
    activateDeactivateClose() {
      this.adModal = 0;
    },
    activate() {
      let me = this;
      let header = { Token: this.$store.state.token };
      let config = { headers: header };
      axios
        .put("user/activate", { _id: this.adId }, config)
        .then(function (response) {
          me.adModal = 0;
          me.adAccion = 0;
          me.adNombre = "";
          me.adId = "";
          me.toList();
        })
        .catch(function (error) {
          console.log(error);
        });
    },
    deactivate() {
      let me = this;
      let header = { Token: this.$store.state.token };
      let config = { headers: header };
      axios
        .put("user/deactivate", { _id: this.adId }, config)
        .then(function (response) {
          me.adModal = 0;
          me.adAccion = 0;
          me.adNombre = "";
          me.adId = "";
          me.toList();
        })
        .catch(function (error) {
          console.log(error);
        });
    },

    clear() {
      this._id = "";
      this.role = "";
      this.identity_card = "";
      this.name = "";
      this.user_name = "";
      this.valid = "";
      this.validationMessage = [];
      this.editedIndex = -1;
    },

    close() {
      this.dialog = false;
    },
  },
};
</script>