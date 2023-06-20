<template>
  <v-layout align-start>
    <v-flex>
      <v-data-table
        :headers="headers"
        :items="loans"
        :search="search"
        sort-by="calories"
        class="elevation-1"
        :items-per-page="8"
        v-if="editPayments == 0"
      >
        <template v-slot:top>
          <v-toolbar flat>
            <v-toolbar-title>Trámites de Préstamos</v-toolbar-title>
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
            <v-spacer></v-spacer>
            <v-dialog v-model="dialog" max-width="1200px">
              <v-card>
                <v-card-title>
                  <span class=" ">{{ formTitle }}</span>
                </v-card-title>

                <v-card-text>
                  <v-container>
                    <v-row>
                      <v-col cols="12" sm="6" md="6">
                        <v-text-field v-model="code" label="N° de Préstamo">
                        </v-text-field>
                      </v-col>
                      <v-col cols="12" sm="6" md="6">
                        <v-text-field
                          v-model="amount_requested"
                          label="Monto Solicitado"
                        >
                        </v-text-field>
                      </v-col>
                      <v-col cols="12" sm="6" md="6">
                        <v-text-field v-model="voucher" label="Comprobante">
                        </v-text-field>
                      </v-col>
                      <v-col cols="12" sm="6" md="6">
                        <v-text-field
                          v-model="amortization"
                          label="Amortizacion"
                        >
                        </v-text-field>
                      </v-col>
                    </v-row>
                    <v-row>
                      <v-col cols="12" sm="6" md="6">
                        <v-menu
                          ref="menu"
                          v-model="menu"
                          :close-on-content-click="false"
                          :return-value.sync="date"
                          transition="scale-transition"
                          offset-y
                          max-width="290px"
                          min-width="290px"
                        >
                          <template v-slot:activator="{ on, attrs }">
                            <v-text-field
                              v-model="request_date"
                              label="Fecha de Solicitud"
                              prepend-icon="mdi-calendar"
                              readonly
                              v-bind="attrs"
                              v-on="on"
                            ></v-text-field>
                          </template>
                          <v-date-picker
                            v-model="request_date"
                            no-title
                            scrollable
                          >
                            <v-spacer></v-spacer>
                            <v-btn text color="primary" @click="menu = false">
                              Cancelar
                            </v-btn>
                            <v-btn
                              text
                              color="primary"
                              @click="$refs.menu.save(request_date)"
                            >
                              guardar
                            </v-btn>
                          </v-date-picker>
                        </v-menu>
                      </v-col>
                      <v-col cols="12" sm="6" md="6">
                        <v-menu
                          ref="menu2"
                          v-model="menu2"
                          :close-on-content-click="false"
                          :return-value.sync="date"
                          transition="scale-transition"
                          offset-y
                          max-width="290px"
                          min-width="290px"
                        >
                          <template v-slot:activator="{ on, attrs }">
                            <v-text-field
                              v-model="debt_date"
                              label="Fecha de Remisión"
                              prepend-icon="mdi-calendar"
                              readonly
                              v-bind="attrs"
                              v-on="on"
                            ></v-text-field>
                          </template>
                          <v-date-picker
                            v-model="debt_date"
                            no-title
                            scrollable
                          >
                            <v-spacer></v-spacer>
                            <v-btn text color="primary" @click="menu2 = false">
                              Cancelar
                            </v-btn>
                            <v-btn
                              text
                              color="primary"
                              @click="$refs.menu2.save(debt_date)"
                            >
                              guardar
                            </v-btn>
                          </v-date-picker>
                        </v-menu>
                      </v-col>
                      <v-col cols="12" sm="6" md="6">
                        <v-text-field
                          v-model="interest_rate"
                          label="Tasa de interés"
                        >
                        </v-text-field>
                      </v-col>
                      <v-col cols="12" sm="6" md="6">
                        <v-text-field v-model="loan_term" label="Meses">
                        </v-text-field>
                      </v-col>
                    </v-row>
                  </v-container>
                </v-card-text>

                <v-card-actions>
                  <v-spacer></v-spacer>
                  <v-btn @click="close"> Cancelar </v-btn>
                  <v-btn color="primary" @click="saveLoan"> Guardar </v-btn>
                </v-card-actions>
              </v-card>
            </v-dialog>
            <v-dialog v-model="kardexModal" max-width="1000px">
              <v-card>
                <v-card-title>
                  <v-btn color="primary" @click="createPrint()">
                    <v-icon>print</v-icon> Kardex del Prestatario
                  </v-btn>
                </v-card-title>
                <v-card-text>
                  <div id="kardex">
                    <header>
                      <table style="width: 100%">
                        <tr>
                          <th>
                            <div id="logo">
                              <img
                                src="data:image/jpeg;base64,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"
                                id="imagen"
                              />

                              <p>
                                MUTUAL DE SERVICIOS AL POLICÍA<br />
                                "MUSERPOL"
                              </p>
                            </div>
                          </th>
                          <th></th>
                          <th>
                            <div id="derecha">
                              <p>
                                Fecha: {{ dataNow }}<br />
                                Usuario: {{ user_name }}
                              </p>
                            </div>
                          </th>
                        </tr>
                        <div>
                          <p id="encabezado">
                            <b> KARDEX DEL PRESTATARIO </b>
                          </p>
                        </div>
                      </table>
                    </header>
                    <br />
                    <section>
                      <div>
                        <table id="datosprincipales">
                          <tbody>
                            <tr>
                              <td id="borde">
                                <strong
                                  >Carnet de Identidad:
                                  {{ affiliate_identity_card }}</strong
                                ><br />
                              </td>
                              <td id="borde">
                                <strong>N° de Préstamo: {{ code }}</strong
                                ><br />
                              </td>
                              <td id="borde">
                                <strong
                                  >Monto Solicitado:
                                  {{ formatCurrency(amount_requested) }}</strong
                                ><br />
                              </td>
                            </tr>
                            <tr>
                              <td id="borde">
                                <strong
                                  >Apellido Paterno:
                                  {{ affiliate_last_name }}</strong
                                ><br />
                              </td>
                              <td id="borde">
                                <strong>Comprobante {{ voucher }}</strong
                                ><br />
                              </td>
                              <td id="borde">
                                <strong
                                  >Amortizacion:
                                  {{ formatCurrency(amortization) }}</strong
                                ><br />
                              </td>
                            </tr>
                            <tr>
                              <td id="borde">
                                <strong
                                  >Apellido Materno:
                                  {{ affiliate_mothers_last_name }}</strong
                                ><br />
                              </td>
                              <td id="borde">
                                <strong
                                  >Fecha de Solicitud:
                                  {{ request_date }}</strong
                                ><br />
                              </td>
                              <td id="borde">
                                <strong
                                  >Tasa de Interés:
                                  {{ interest_rate }} %</strong
                                ><br />
                              </td>
                            </tr>
                            <tr>
                              <td id="borde">
                                <strong>Nombres: {{ affiliate_name }}</strong
                                ><br />
                              </td>
                              <td id="borde">
                                <strong>Meses: {{ loan_term }}</strong
                                ><br />
                              </td>
                              <td id="borde">
                                <strong
                                  >Tasa de Interés Penal:
                                  {{ interest_rate }} %</strong
                                ><br />
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </section>
                    <br />
                    <section>
                      <div>
                        <table id="facarticulo">
                          <thead>
                            <tr id="fa">
                              <th style="text-align: center; width: 3%">
                                Nro.
                              </th>
                              <th style="text-align: center; width: 8%">
                                Fecha <br />
                                de Cálculo
                              </th>
                              <th style="text-align: center; width: 8%">
                                Monto Mensual
                              </th>
                              <th style="text-align: center; width: 8%">
                                Amortización
                              </th>
                              <th style="text-align: center; width: 8%">
                                Otros <br />
                                Cobros
                              </th>
                              <th style="text-align: center; width: 8%">
                                Interés
                              </th>
                              <th style="text-align: center; width: 8%">D/C</th>
                              <th style="text-align: center; width: 8%">
                                Interés <br />
                                Penal
                              </th>
                              <th style="text-align: center; width: 8%">
                                Cuota <br />
                                Mensual
                              </th>
                              <th style="text-align: center; width: 10%">
                                Saldo <br />
                                Capital
                              </th>
                              <th style="text-align: center; width: 10%">
                                Tipo <br />
                                de Pago
                              </th>
                              <th style="text-align: center; width: 8%">
                                Nro. de Documento
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr
                              v-for="payment in itemsWithIndex"
                              :key="payment._id"
                            >
                              <td id="payment" style="text-align: center">
                                {{ payment.index }}
                              </td>
                              <td id="payment" style="text-align: center">
                                {{ payment.date }}
                              </td>
                              <td id="payment" style="text-align: right">
                                {{ formatCurrency(payment.estimated_quota) }}
                              </td>
                              <td id="payment" style="text-align: right">
                                {{ formatCurrency(payment.quota) }}
                              </td>
                              <td id="payment" style="text-align: right">
                                {{ formatCurrency(payment.other_charge) }}
                              </td>
                              <td id="payment" style="text-align: right">
                                {{ formatCurrency(payment.interest) }}
                              </td>
                              <td id="payment" style="text-align: right">
                                {{ formatCurrency(payment.d_c) }}
                              </td>
                              <td id="payment" style="text-align: right">
                                {{
                                  formatCurrency(payment.accumulated_interest)
                                }}
                              </td>
                              <td id="payment" style="text-align: right">
                                {{ formatCurrency(payment.total) }}
                              </td>
                              <td id="payment" style="text-align: right">
                                {{ formatCurrency(payment.balance) }}
                              </td>
                              <td id="payment" style="text-align: center">
                                {{ payment.receipt }}
                              </td>
                              <td style="text-align: center; font-size: 12px">
                                {{ payment.registry }}
                              </td>
                            </tr>
                          </tbody>
                          <tfoot>
                            <tr>
                              <th id="totals"></th>
                              <th id="totals"></th>
                              <th id="totals"></th>
                              <th id="totals">
                                {{ formatCurrency(calcAmort) }}
                              </th>
                              <th id="totals">
                                {{ formatCurrency(calcOtherCharge) }}
                              </th>
                              <th id="totals">
                                {{ formatCurrency(calcInterest) }}
                              </th>
                              <th id="totals">{{ formatCurrency(calcDC) }}</th>
                              <th id="totals">
                                {{ formatCurrency(calcAccumulatedInterest) }}
                              </th>
                              <th id="totals">
                                {{ formatCurrency(calcTotal) }}
                              </th>
                              <th id="totals">
                                {{ formatCurrency(calcBalance) }}
                              </th>
                              <th id="totals"></th>
                              <th id="totals"></th>
                            </tr>
                            <tr>
                              <th></th>
                              <th></th>
                              <th></th>
                              <th style="text-align: right"></th>
                              <th style="text-align: right"></th>
                            </tr>
                          </tfoot>
                        </table>
                      </div>
                    </section>
                  </div>
                </v-card-text>
                <v-card-actions>
                  <v-btn color="primary" @click="hideKardex()">
                    Cancelar
                  </v-btn>
                </v-card-actions>
              </v-card>
            </v-dialog>
          </v-toolbar>
        </template>
        <template v-slot:[`item.actions`]="{ item }">
          <v-icon class="mr-2" @click="editLoan(item)"> mdi-pencil </v-icon>
          <v-icon class="mr-2" @click="showPayments(item)"> tab </v-icon>
          <v-icon class="mr-2" @click="showKardex(item)">print</v-icon>
        </template>
        <template v-slot:no-data>
          <v-btn color="primary" @click="toList()"> Actualizar </v-btn>
        </template>
      </v-data-table>

      <v-container grid-list-sm class="pa-4 white" v-if="editPayments">
        <v-toolbar-title
          >Kardex de: {{ affiliate_last_name }}
          {{ affiliate_mothers_last_name }}
          {{ affiliate_name }}</v-toolbar-title
        >
        <br />
        <v-spacer> </v-spacer>
        <v-layout row wrap>
          <v-flex xs12 sm2 md2 lg2 xl2>
            <v-text-field
              outlined
              readonly
              v-model="code"
              label="N° de Préstamo"
            >
            </v-text-field>
          </v-flex>
          <v-flex xs12 sm2 md2 lg2 xl2>
            <v-text-field
              outlined
              readonly
              v-model="amount_requested"
              label="Monto Solicitado"
            >
            </v-text-field>
          </v-flex>
          <v-flex xs12 sm2 md2 lg2 xl2>
            <v-text-field
              outlined
              readonly
              v-model="voucher"
              label="Comprobante"
            >
            </v-text-field>
          </v-flex>
          <v-flex xs12 sm2 md2 lg2 xl2>
            <v-text-field
              outlined
              readonly
              v-model="request_date"
              label="Fecha de Solicitud"
            >
            </v-text-field>
          </v-flex>
          <v-flex xs12 sm2 md2 lg2 xl2>
            <v-text-field
              outlined
              readonly
              v-model="debt_date"
              label="Fecha de Remisión"
            >
            </v-text-field>
          </v-flex>
          <v-flex xs12 sm2 md2 lg2 xl2>
            <v-text-field outlined readonly v-model="loan_term" label="Meses">
            </v-text-field>
          </v-flex>

          <v-flex xs12 sm12 md12 lg12 xl12>
            <template>
              <v-data-table
                :headers="headersPayments"
                :items="itemsWithIndex"
                :items-per-page="5"
                class="elevation-1"
              >
                <template v-slot:top>
                  <v-toolbar flat>
                    <v-spacer></v-spacer>
                    <v-dialog v-model="dialogAmort" max-width="800px">
                      <template v-slot:activator="{ on, attrs }">
                        <v-btn
                          color="primary"
                          dark
                          class="mb-2"
                          v-bind="attrs"
                          v-on="on"
                        >
                          Amortizar
                        </v-btn>
                      </template>
                      <v-card>
                        <v-card-title>
                          <span class="headline">Amortizar</span>
                        </v-card-title>
                        <v-container fluid>
                          <v-switch
                            v-model="liquidate"
                            inset
                            label="Liquidar"
                            color="orange"
                            hide-details
                          ></v-switch>
                        </v-container>
                        <v-card-text>
                          <v-container>
                            <v-row>
                              <v-col cols="12" sm="6" md="6">
                                <v-menu
                                  ref="menu3"
                                  v-model="menu3"
                                  :close-on-content-click="false"
                                  :return-value.sync="date"
                                  transition="scale-transition"
                                  offset-y
                                  max-width="290px"
                                  min-width="290px"
                                >
                                  <template v-slot:activator="{ on, attrs }">
                                    <v-text-field
                                      v-model="date"
                                      label="Fecha de Calculo"
                                      prepend-icon="mdi-calendar"
                                      readonly
                                      v-bind="attrs"
                                      v-on="on"
                                    ></v-text-field>
                                  </template>
                                  <v-date-picker
                                    v-model="date"
                                    no-title
                                    scrollable
                                  >
                                    <v-spacer></v-spacer>
                                    <v-btn
                                      text
                                      color="primary"
                                      @click="menu3 = false"
                                    >
                                      Cancelar
                                    </v-btn>
                                    <v-btn
                                      text
                                      color="primary"
                                      @click="$refs.menu3.save(date)"
                                    >
                                      guardar
                                    </v-btn>
                                  </v-date-picker>
                                </v-menu>
                              </v-col>
                              <v-col cols="12" sm="6" md="6">
                                <v-text-field
                                  v-model="total"
                                  v-money="mask"
                                  label="Monto"
                                ></v-text-field>
                              </v-col>
                              <v-col cols="12" sm="6" md="6">
                                <v-text-field
                                  v-model="receipt"
                                  label="Tipo de Pago"
                                ></v-text-field>
                              </v-col>
                              <v-col cols="12" sm="6" md="6">
                                <v-text-field
                                  v-model="registry"
                                  label="Nro. de Documento"
                                ></v-text-field>
                              </v-col>
                              <v-col cols="12" sm="12" md="12">
                                <v-text-field
                                  v-model="glosa"
                                  label="Detalle"
                                ></v-text-field>
                              </v-col>
                            </v-row>
                          </v-container>
                        </v-card-text>

                        <v-card-actions>
                          <v-spacer></v-spacer>
                          <v-btn color="blue darken-1" text @click="close">
                            Cancelar
                          </v-btn>
                          <v-btn color="blue darken-1" text @click="saveAmort">
                            Guardar
                          </v-btn>
                        </v-card-actions>
                      </v-card>
                    </v-dialog>
                    <v-dialog v-model="dialogAmort2" max-width="800px">
                      <v-card>
                        <v-card-title>
                          <span class="headline">Editar Amortización</span>
                        </v-card-title>
                        <v-container fluid>
                        </v-container>
                        <v-card-text>
                          <v-container>
                            <v-row>
                              <v-col cols="12" sm="6" md="6">
                                <v-text-field
                                  v-model="receipt"
                                  label="Tipo de Pago"
                                ></v-text-field>
                              </v-col>
                              <v-col cols="12" sm="6" md="6">
                                <v-text-field
                                  v-model="registry"
                                  label="Nro. de Documento"
                                ></v-text-field>
                              </v-col>
                              <v-col cols="12" sm="12" md="12">
                                <v-text-field
                                  v-model="glosa"
                                  label="Detalle"
                                ></v-text-field>
                              </v-col>
                            </v-row>
                          </v-container>
                        </v-card-text>

                        <v-card-actions>
                          <v-spacer></v-spacer>
                          <v-btn color="blue darken-1" text @click="close">
                            Cancelar
                          </v-btn>
                          <v-btn color="blue darken-1" text @click="saveAmort">
                            Guardar
                          </v-btn>
                        </v-card-actions>
                      </v-card>
                    </v-dialog>
                    <v-dialog v-model="voucherModal" max-width="1050px">
                      <v-card>
                        <v-card-title>
                          <v-btn color="primary" @click="createPrintVoucher()">
                            <v-icon>print</v-icon> Amortización de Cuota
                          </v-btn>
                        </v-card-title>
                        <v-card-text>
                          <div id="voucherprint">
                            <header>
                              <table style="width: 100%">
                                <tr>
                                  <th>
                                    <div id="logo">
                                      <img
                                        src="data:image/jpeg;base64,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"
                                        id="imagen"
                                      />

                                      <p>
                                        MUTUAL DE SERVICIOS AL POLICÍA<br />
                                        "MUSERPOL"
                                      </p>
                                    </div>
                                  </th>
                                  <th></th>
                                  <th>
                                    <div id="derecha">
                                      <p>
                                        Fecha: {{ dataNow }}<br />
                                        Usuario: {{ user_name }}
                                      </p>
                                    </div>
                                  </th>
                                </tr>
                                <div>
                                  <p id="encabezado2">
                                    <b>
                                      Amortización de Cuota<br />
                                      N° {{ code }}<br />
                                      RESOLUCIÓN Nº 29/2020<br />
                                      {{ receipt }}
                                    </b>
                                  </p>
                                </div>
                              </table>
                            </header>
                            <section>
                              <div>
                                <table id="facliente">
                                  <tbody>
                                    <tr>
                                      <td id="cliente">
                                        <strong
                                          >Deudor: {{ affiliate_name }}
                                          {{ affiliate_last_name }}
                                          {{
                                            affiliate_mothers_last_name
                                          }}</strong
                                        ><br />
                                        <strong
                                          >Fecha Desembolso:
                                          {{ request_date }}</strong
                                        ><br />
                                      </td>
                                    </tr>
                                  </tbody>
                                </table>
                              </div>
                            </section>
                            <section>
                              <div>
                                <table id="datosprincipales" style="width: 99%">
                                  <tbody>
                                    <tr>
                                      <td id="borde">
                                        <strong>Capital:</strong><br />
                                      </td>
                                      <td id="borde3">
                                        <strong>{{
                                          formatCurrency(quota)
                                        }}</strong
                                        ><br />
                                      </td>
                                      <td id="borde">
                                        <strong>Fecha de Cálculo:</strong><br />
                                      </td>
                                      <td id="borde3">
                                        <strong>{{ date }}</strong
                                        ><br />
                                      </td>
                                    </tr>
                                    <tr>
                                      <td id="borde">
                                        <strong>Interes por 12% anual:</strong
                                        ><br />
                                      </td>
                                      <td id="borde3">
                                        <strong>{{
                                          formatCurrency(interest)
                                        }}</strong
                                        ><br />
                                      </td>
                                      <td id="borde">
                                        <strong>Fecha de Cobro:</strong><br />
                                      </td>
                                      <td id="borde3">
                                        <strong>{{ transaction_date }}</strong
                                        ><br />
                                      </td>
                                    </tr>
                                    <tr>
                                      <td id="borde">
                                        <strong
                                          >Intereses Penal por 12%
                                          anual:</strong
                                        ><br />
                                      </td>
                                      <td id="borde3">
                                        <strong>{{
                                          formatCurrency(accumulated_interest)
                                        }}</strong
                                        ><br />
                                      </td>
                                      <td id="borde">
                                        <strong>Saldo Anterior:</strong><br />
                                      </td>
                                      <td id="borde3">
                                        <strong>{{
                                          formatCurrency(old_balance)
                                        }}</strong
                                        ><br />
                                      </td>
                                    </tr>
                                    <tr>
                                      <td id="borde">
                                        <strong>Otros Cobros:</strong><br />
                                      </td>
                                      <td id="borde3">
                                        <strong>{{
                                          formatCurrency(other_charge)
                                        }}</strong
                                        ><br />
                                      </td>
                                      <td id="borde">
                                        <strong>Saldo Actual:</strong><br />
                                      </td>
                                      <td id="borde3">
                                        <strong>{{
                                          formatCurrency(balance)
                                        }}</strong
                                        ><br />
                                      </td>
                                    </tr>
                                  </tbody>
                                </table>
                              </div>
                            </section>
                            <section>
                              <div>
                                <table id="datosprincipales" style="width: 99%">
                                  <tbody>
                                    <tr>
                                      <td id="borde">
                                        <strong>Total a pagar:</strong><br />
                                      </td>
                                      <td id="borde">
                                        <strong>{{
                                          formatCurrency(total)
                                        }}</strong
                                        ><br />
                                      </td>
                                    </tr>
                                    <tr>
                                      <td id="borde">
                                        <strong>Son:</strong><br />
                                      </td>
                                      <td id="borde">
                                        <strong>{{ literal }}</strong
                                        ><br />
                                      </td>
                                    </tr>
                                    <tr>
                                      <td id="borde">
                                        <strong>Glosa:</strong><br />
                                      </td>
                                      <td id="borde">
                                        <strong>{{ glosa }}</strong
                                        ><br />
                                      </td>
                                    </tr>
                                  </tbody>
                                </table>
                              </div>
                            </section>
                            <section>
                              <div>
                                <table id="datosprincipales" style="width: 99%">
                                  <br />
                                  <br />
                                  <br />
                                  <tbody>
                                    <tr>
                                      <td id="borde2">
                                        <strong>__________________</strong
                                        ><br />
                                      </td>
                                      <td id="borde2">
                                        <strong>__________________</strong
                                        ><br />
                                      </td>
                                      <td id="borde2">
                                        <strong>__________________</strong
                                        ><br />
                                      </td>
                                    </tr>
                                    <tr>
                                      <td id="borde2">
                                        <strong>ELABORADO POR</strong><br />
                                      </td>
                                      <td id="borde2">
                                        <strong>PAGADO POR</strong><br />
                                      </td>
                                      <td id="borde2">
                                        <strong>COBRADO POR</strong><br />
                                      </td>
                                    </tr>
                                  </tbody>
                                </table>
                                <p>
                                  ** Esta liquidacion no es valida sin el
                                  Refrendo y Sello de Cobranzas **
                                </p>
                              </div>
                            </section>
                          </div>
                        </v-card-text>
                        <v-card-actions>
                          <v-btn color="primary" @click="hideVoucher()">
                            Cancelar
                          </v-btn>
                        </v-card-actions>
                      </v-card>
                    </v-dialog>
                  </v-toolbar>
                </template>

                <template v-slot:[`item.actions`]="{ item }">
                  <v-icon @click="editPayment(item)">edit</v-icon>
                  <v-icon @click="showVoucher(item)">print</v-icon>
                </template>
              </v-data-table>
            </template>
          </v-flex>

          <v-btn color="primary" @click.native="hideEditPayments()"
            >Volver</v-btn
          >
          <v-spacer></v-spacer>

          <v-btn color="primary" @click="addInt(_id)">+ interés</v-btn>
          <v-divider class="mx-4" inset vertical></v-divider>
          <v-btn color="primary" @click="addAccint(_id)">+ interés Penal</v-btn>
          <v-spacer></v-spacer>
        </v-layout>
      </v-container>
    </v-flex>
  </v-layout>
</template>

<script>
import axios from "axios";
import moment from "moment";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import html2canvas from "html2canvas";
import { VMoney } from "v-money";

export default {
  data() {
    return {
      dialog: false,
      dialogAmort: false,
      dialogAmort2: false,
      search: "",
      loans: [],
      headers: [
        { text: "CI Afiliado", value: "affiliate.identity_card" },
        { text: "N° de Préstamo", value: "code" },
        { text: "Comprobante", value: "voucher" },
        { text: "Fecha Solicitud", value: "request_date" },
        { text: "Monto Solicitado", value: "amount_requested" },
        { text: "Meses", value: "loan_term" },
        { text: "Tipo", value: "type" },
        { text: "Opciones", value: "actions", sortable: false },
      ],
      editedIndex: -1,
      editedVoucher: -1,
      _id: "",
      affiliate_identity_card: "",
      affiliate_last_name: "",
      affiliate_mothers_last_name: "",
      affiliate_name: "",

      dataNow: "",

      code: "",
      voucher: "",
      request_date: "",
      debt_date: "",
      amount_requested: "",
      loan_term: "",
      amortization: "",
      interest_rate: "",
      type: "",

      user_name: "",

      payments: [],
      headersPayments: [
        { text: "Nro.", value: "index" },
        { text: "Fecha de Cálculo", value: "date" },
        { text: "Fecha de Cobro", value: "transaction_date" },
        { text: "Monto Mensual", value: "estimated_quota" },
        { text: "Amortización", value: "quota" },
        { text: "Otros Cobros", value: "other_charge" },
        { text: "Interes", value: "interest" },
        { text: "D/C", value: "d_c" },
        { text: "Interes Penal", value: "accumulated_interest" },
        { text: "Cuota Mensual", value: "total" },
        { text: "Saldo Capital", value: "balance" },
        { text: "Tipo de Pago", value: "receipt" },
        { text: "Nro. de Documento", value: "registry" },
        { text: "Opciones", value: "actions", sortable: false },
      ],
      
      payment_id:"",
      date: "",
      transaction_date: "",
      quota: "",
      total: "",
      balance: "",
      receipt: "",
      registry: "",
      glosa: "",
      old_balance: "",
      interest: "",
      accumulated_interest: "",
      other_charge: "",
      literal: "",
      liquidate: "",

      editPayments: 0,
      valid: 0,
      validationMessage: [],
      kardexModal: 0,

      voucherModal: 0,

      menu: false,
      menu2: false,
      menu3: false,
      mask: {
        decimal: ".",
        thousands: "",
        prefix: "",
        suffix: "",
        precision: 2,
        masked: false,
      },
    };
  },

  directives: { money: VMoney },

  computed: {
    formTitle() {
      return "Editar Trámite";
    },
    itemsWithIndex() {
      return this.payments.map((payments, index) => ({
        ...payments,
        index: index + 1,
      }));
    },
    calcAmort: function () {
      let result = 0.0;
      for (var i = 0; i < this.payments.length; i++) {
        result = result + this.payments[i].quota;
      }
      return result.toFixed(2);
    },
    calcOtherCharge: function () {
      let result = 0.0;
      for (var i = 0; i < this.payments.length; i++) {
        result = result + this.payments[i].other_charge;
      }
      return result.toFixed(2);
    },
    calcInterest: function () {
      let result = 0.0;
      for (var i = 0; i < this.payments.length; i++) {
        result = result + this.payments[i].interest;
      }
      return result.toFixed(2);
    },
    calcDC: function () {
      let result = 0.0;
      for (var i = 0; i < this.payments.length; i++) {
        result = result + this.payments[i].d_c;
      }
      return result.toFixed(2);
    },
    calcAccumulatedInterest: function () {
      let result = 0.0;
      for (var i = 0; i < this.payments.length; i++) {
        result = result + parseFloat(this.payments[i].accumulated_interest);
      }
      return result.toFixed(2);
    },
    calcTotal: function () {
      let result = 0.0;
      for (var i = 0; i < this.payments.length; i++) {
        result = result + this.payments[i].total;
      }
      return result.toFixed(2);
    },
    calcBalance: function () {
      let result = 0.0;
      for (var i = 0; i < this.payments.length; i++) {
        result = this.payments[i].balance;
      }
      return result.toFixed(2);
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
    formatCurrency(value) {
      let val = (value / 1).toFixed(2).replace(",", ".");
      return val.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    },

    toList() {
      let me = this;
      let header = { token: this.$store.state.token };
      let config = { headers: header };
      axios
        .get("loan/list", config)
        .then(function (response) {
          me.loans = response.data;
        })
        .catch(function (error) {
          console.log(error);
        });
    },

    validate() {
      this.valid = 0;
      this.validationMessage = [];

      if (this.validationMessage.length) {
        this.valid = 1;
      }
      return this.valid;
    },

    listPayments(id) {
      let me = this;
      let header = { token: this.$store.state.token };
      let config = { headers: header };
      axios
        .get("payment/list?loan_id=" + id, config)
        .then(function (response) {
          me.payments = response.data;
          me.payments.map((payments, index) => ({
            ...payments,
            index: index + 1,
          }));
        })
        .catch(function (error) {
          console.log(error);
        });
    },

    showPayments(item) {
      this.clear();
      this._id = item._id;
      this.affiliate_identity_card = item.affiliate.identity_card;
      this.affiliate_last_name = item.affiliate.last_name;
      this.affiliate_mothers_last_name = item.affiliate.mothers_last_name;
      this.affiliate_name = item.affiliate.name;

      this.code = item.code;
      this.voucher = item.voucher;
      this.request_date = item.request_date;
      if (item.debt_date) {
        this.debt_date = moment(item.debt_date)
          .add("days", 1)
          .format("YYYY-MM-DD");
      }

      this.amount_requested = item.amount_requested;
      this.loan_term = item.loan_term;
      this.amortization = item.amortization;
      this.interest_rate = item.interest_rate;
      this.type = item.type;

      this.listPayments(item._id);
      this.editPayments = 1;
    },
    hideEditPayments() {
      this.editPayments = 0;
      this.clear();
    },
    saveAmort() {
      let me = this;
      let header = { token: this.$store.state.token };
      let config = { headers: header };
      if (this.validate()) {
        return;
      }
      
      if (this.editedVoucher > -1) {
        axios
          .put(
            "payment/update",
            {
              _id: this.payment_id,
              receipt: this.receipt,
              glosa: this.glosa,
              registry: this.registry,
            },
            config
          )
          .then(function (response) {
            me.close();
            me.toList();
          })
          .catch(function (error) {
            console.log(error);
          });
      } else {
        axios
          .post(
            "payment/add",
            {
              liquidate: this.liquidate,
              loan: this._id,
              date: this.date,
              transaction_date: moment(new Date()).local().format("YYYY-MM-DD"),
              total: this.total,
              receipt: this.receipt,
              glosa: this.glosa,
              registry: this.registry,
            },
            config
          )
          .then(function (response) {
            me.close();
            me.toList();
          })
          .catch(function (error) {
            console.log(error);
          });
      }
      this.hideEditPayments();
      this.dialogAmort2 = false;
      this.dialogAmort = false;
    },
    saveLoan() {
      let me = this;
      let header = { token: this.$store.state.token };
      let config = { headers: header };
      if (this.validate()) {
        return;
      }
      if (this.editedIndex > -1) {
        axios
          .put(
            "loan/update",
            {
              _id: this._id,
              code: this.code,
              voucher: this.voucher,
              request_date: this.request_date,
              debt_date: this.debt_date,
              amount_requested: this.amount_requested,
              loan_term: this.loan_term,
              amortization: this.amortization,
              interest_rate: this.interest_rate,
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
        //
      }
      this.close();
    },
    addInt(id) {
      console.log(id);
      let me = this;
      let header = { token: this.$store.state.token };
      let config = { headers: header };
      if (this.validate()) {
        return;
      }
      axios
        .get("loan/queryint?_id=" + id, config)
        .then(function (response) {
          me.clear();
          me.toList();
        })
        .catch(function (error) {
          console.log(error);
        });
      this.editPayments = 0;
    },
    addAccint(id) {
      let me = this;
      let header = { token: this.$store.state.token };
      let config = { headers: header };
      if (this.validate()) {
        return;
      }
      axios
        .get("loan/queryaccint?_id=" + id, config)
        .then(function (response) {
          me.clear();
          me.toList();
        })
        .catch(function (error) {
          console.log(error);
        });
      this.editPayments = 0;
    },

    editLoan(item) {
      this._id = item._id;
      this.code = item.code;
      this.voucher = item.voucher;
      this.request_date = item.request_date;
      this.debt_date = moment(item.debt_date)
        .add("days", 1)
        .format("YYYY-MM-DD");
      this.amount_requested = item.amount_requested;
      this.loan_term = item.loan_term;
      this.amortization = item.amortization;
      this.interest_rate = item.interest_rate;
      this.type = item.type;
      this.editedIndex = 1;
      this.dialog = true;
    },

    clear() {
      this._id = "";
      this.code = "";
      this.voucher = "";
      this.request_date = "";
      this.debt_date = "";
      this.amount_requested = "";
      this.loan_term = "";
      this.amortization = "";
      this.interest_rate = "";
      this.type = "";
      this.valid = "";
      this.validationMessage = [];
      this.editedIndex = -1;
      this.editedVoucher = -1;
      this.date = "";
      this.total = "";
      this.receipt = "";
      this.registry = "";
      this.glosa = "";
      this.liquidate= false;
    },

    close() {
      this.dialog = false;
      this.dialogAmort = false;
      this.dialogAmort2 = false;
      this.liquidate= false;
    },

    showKardex(item) {
      this.clear();

      this.dataNow = moment(new Date()).local().format("DD-MM-YYYY - HH:mm");
      this.affiliate_identity_card = item.affiliate.identity_card;
      this.affiliate_last_name = item.affiliate.last_name;
      this.affiliate_mothers_last_name = item.affiliate.mothers_last_name;
      this.affiliate_name = item.affiliate.name;
      this.user_name = this.$store.state.user.user_name;

      this.code = item.code;
      this.voucher = item.voucher;
      this.request_date = item.request_date;
      this.debt_date = item.debt_date;
      this.amount_requested = item.amount_requested;
      this.loan_term = item.loan_term;
      this.amortization = item.amortization;
      this.interest_rate = item.interest_rate;
      this.type = item.type;

      this.listPayments(item._id);
      this.kardexModal = 1;
    },
    hideKardex() {
      this.kardexModal = 0;
    },
    editPayment(item) {
      this.payment_id = item._id;
      this.receipt = item.receipt;
      this.registry = item.registry;
      this.glosa = item.glosa;
      this.editedVoucher = 1;
      this.dialogAmort2 = 1;
    },
    showVoucher(item) {
      this.clear();

      this.dataNow = moment(new Date()).local().format("DD-MM-YYYY - HH:mm");

      this.code = item.loan.code;
      this.receipt = item.receipt;
      this.user_name = this.$store.state.user.user_name;
      this.request_date = item.loan.request_date;

      this.quota = item.quota;
      this.total = item.total;
      this.old_balance = parseFloat(item.balance) + parseFloat(item.total);
      this.other_charge = item.other_charge;
      this.date = item.date;
      this.interest = item.interest;
      this.accumulated_interest = item.accumulated_interest;
      this.transaction_date = item.transaction_date;
      this.literal = NumeroALetras(parseFloat(item.total));
      this.registry = item.registry;
      this.balance = item.balance;
      this.glosa = item.glosa;

      this.voucherModal = 1;
    },

    hideVoucher() {
      this.voucherModal = 0;
    },

    createPrint() {
      var quotes = document.getElementById("kardex");
      html2canvas(quotes).then(function (canvas) {
        var imgData = canvas.toDataURL("image/png");
        var imgWidth = 585;
        var pageHeight = 842;

        var imgHeight = (canvas.height * imgWidth) / canvas.width - 10;
        var heightLeft = imgHeight;

        var doc = new jsPDF("p", "pt", "a4");
        var position = 15;

        doc.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;

        while (heightLeft >= 0) {
          position = heightLeft - imgHeight;
          doc.addPage();
          doc.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
          heightLeft -= pageHeight;
        }
        doc.save("Kardex.pdf");
      });
    },
    createPrintVoucher() {
      var quotes = document.getElementById("voucherprint");
      html2canvas(quotes).then(function (canvas) {
        var imgData = canvas.toDataURL("image/jpeg", 1.0);
        var imgWidth = 585;
        var pageHeight = 842;

        var imgHeight = (canvas.height * imgWidth) / canvas.width - 10;

        var doc = new jsPDF("p", "pt", "a4");
        var position = 15;

        doc.addImage(imgData, "JPEG", 5, position, imgWidth, imgHeight);

        doc.save("Comprobante.pdf");
      });
    },
  },
};

function Unidades(num) {
  switch (num) {
    case 1:
      return "UN";
    case 2:
      return "DOS";
    case 3:
      return "TRES";
    case 4:
      return "CUATRO";
    case 5:
      return "CINCO";
    case 6:
      return "SEIS";
    case 7:
      return "SIETE";
    case 8:
      return "OCHO";
    case 9:
      return "NUEVE";
  }

  return "";
}

function Decenas(num) {
  var decena = Math.floor(num / 10);
  var unidad = num - decena * 10;

  switch (decena) {
    case 1:
      switch (unidad) {
        case 0:
          return "DIEZ";
        case 1:
          return "ONCE";
        case 2:
          return "DOCE";
        case 3:
          return "TRECE";
        case 4:
          return "CATORCE";
        case 5:
          return "QUINCE";
        default:
          return "DIECI" + Unidades(unidad);
      }
    case 2:
      switch (unidad) {
        case 0:
          return "VEINTE";
        default:
          return "VEINTI" + Unidades(unidad);
      }
    case 3:
      return DecenasY("TREINTA", unidad);
    case 4:
      return DecenasY("CUARENTA", unidad);
    case 5:
      return DecenasY("CINCUENTA", unidad);
    case 6:
      return DecenasY("SESENTA", unidad);
    case 7:
      return DecenasY("SETENTA", unidad);
    case 8:
      return DecenasY("OCHENTA", unidad);
    case 9:
      return DecenasY("NOVENTA", unidad);
    case 0:
      return Unidades(unidad);
  }
} //Unidades()

function DecenasY(strSin, numUnidades) {
  if (numUnidades > 0) return strSin + " Y " + Unidades(numUnidades);

  return strSin;
} //DecenasY()

function Centenas(num) {
  var centenas = Math.floor(num / 100);
  var decenas = num - centenas * 100;

  switch (centenas) {
    case 1:
      if (decenas > 0) return "CIENTO " + Decenas(decenas);
      return "CIEN";
    case 2:
      return "DOSCIENTOS " + Decenas(decenas);
    case 3:
      return "TRESCIENTOS " + Decenas(decenas);
    case 4:
      return "CUATROCIENTOS " + Decenas(decenas);
    case 5:
      return "QUINIENTOS " + Decenas(decenas);
    case 6:
      return "SEISCIENTOS " + Decenas(decenas);
    case 7:
      return "SETECIENTOS " + Decenas(decenas);
    case 8:
      return "OCHOCIENTOS " + Decenas(decenas);
    case 9:
      return "NOVECIENTOS " + Decenas(decenas);
  }

  return Decenas(decenas);
} //Centenas()

function Seccion(num, divisor, strSingular, strPlural) {
  var cientos = Math.floor(num / divisor);
  var resto = num - cientos * divisor;

  var letras = "";

  if (cientos > 0)
    if (cientos > 1) letras = Centenas(cientos) + " " + strPlural;
    else letras = strSingular;

  if (resto > 0) letras += "";

  return letras;
} //Seccion()

function Miles(num) {
  var divisor = 1000;
  var cientos = Math.floor(num / divisor);
  var resto = num - cientos * divisor;

  var strMiles = Seccion(num, divisor, "UN MIL", "MIL");
  var strCentenas = Centenas(resto);

  if (strMiles == "") return strCentenas;

  return strMiles + " " + strCentenas;

  //return Seccion(num, divisor, "UN MIL", "MIL") + " " + Centenas(resto);
} //Miles()

function Millones(num) {
  var divisor = 1000000;
  var cientos = Math.floor(num / divisor);
  var resto = num - cientos * divisor;

  var strMillones = Seccion(num, divisor, "UN MILLON", "MILLONES");
  var strMiles = Miles(resto);

  if (strMillones == "") return strMiles;

  return strMillones + " " + strMiles;

  //return Seccion(num, divisor, "UN MILLON", "MILLONES") + " " + Miles(resto);
} //Millones()
function zfill(number, width) {
  var numberOutput = Math.abs(number); /* Valor absoluto del número */
  var length = number.toString().length; /* Largo del número */
  var zero = "0"; /* String de cero */

  if (width <= length) {
    if (number < 0) {
      return "-" + numberOutput.toString();
    } else {
      return numberOutput.toString();
    }
  } else {
    if (number < 0) {
      return "-" + zero.repeat(width - length) + numberOutput.toString();
    } else {
      return zero.repeat(width - length) + numberOutput.toString();
    }
  }
}
function NumeroALetras(num) {
  var data = {
    numero: num,
    enteros: Math.floor(num),
    centavos: zfill(Math.round(num * 100) - Math.floor(num) * 100, 2),
    letrasCentavos: "",
    letrasMonedaPlural: "BOLIVIANOS",
    letrasMonedaSingular: "BOLIVIANO",
  };

  data.letrasCentavos = "CON " + data.centavos + "/100";

  if (data.enteros == 0)
    return "CERO " + " " + data.letrasCentavos + " " + data.letrasMonedaPlural;
  if (data.enteros == 1)
    return (
      Millones(data.enteros) +
      " " +
      data.letrasCentavos +
      " " +
      data.letrasMonedaSingular
    );
  else
    return (
      Millones(data.enteros) +
      " " +
      data.letrasCentavos +
      " " +
      data.letrasMonedaPlural
    );
} //NumeroALetras()
</script>

<style>
#kardex {
  padding: 20px;
  font-family: Arial, sans-serif;
  font-size: 16px;
}

#derecha {
  padding: 20px;
  font-size: 16px;
  float: right;
  text-align: right;
}

#logo {
  float: left;
  margin-left: 2%;
  margin-right: 2%;
}
#imagen {
  width: 150px;
}

#fact {
  font-size: 18px;
  font-weight: bold;
  text-align: center;
}

#datos {
  float: left;
  margin-top: 0%;
  margin-left: 2%;
  margin-right: 2%;
}

#encabezado {
  text-align: center;
  margin-left: 300px;
  margin-right: 10px;
  font-size: 20px;
  font-weight: bold;
}
#encabezado2 {
  text-align: center;
  margin-left: 300px;
  margin-right: 10px;
  font-size: 16px;
  font-weight: bold;
}

section {
  clear: left;
}

#cliente {
  text-align: left;
}

#datosprincipales {
  width: 40%;
  border: 1px solid #aaaaaa;
  padding: 3px 3px;
  margin-bottom: 5px;
  width: 100%;
  font-size: 14px;
  -webkit-border-radius: 10px;
  -moz-border-radius: 10px;
  border-radius: 10px;
}
#borde {
  padding: 3px 3px;
}

#borde2 {
  padding: 3px 3px;
  float: center;
  text-align: center;
}
#borde3 {
  padding: 3px 40px;
  float: right;
  text-align: right;
}

#fa {
  color: #000000;
  font-size: 11px;
  text-align: center;
  padding: 20px;
}

#facarticulo {
  width: 100%;
  border-collapse: collapse;
  border-spacing: 1px;
  padding: 20px;
  margin-bottom: 15px;
  table-layout: fixed;
}

#facarticulo thead {
  padding: 0px;
  background: #aaaaaa;
  text-align: center;
  border-bottom: 10px solid #ffffff;
}

#gracias {
  text-align: center;
}

#payment {
  border-right: 2px solid #a4a09c;
  padding: 0px 5px;
  font-size: 12px;
}
#totals {
  text-align: right;
  border-top: 3px solid #aaaaaa;
  font-size: 14px;
}
</style>