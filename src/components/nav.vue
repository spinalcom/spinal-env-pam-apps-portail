<!--
Copyright 2022 SpinalCom - www.spinalcom.com

This file is part of SpinalCore.

Please read all of the following terms and conditions
of the Free Software license Agreement ("Agreement")
carefully.

This Agreement is a legally binding contract between
the Licensee (as defined below) and SpinalCom that
sets forth the terms and conditions that govern your
use of the Program. By installing and/or using the
Program, you agree to abide by all the terms and
conditions stated or referenced herein.

If you do not agree to abide by these terms and
conditions, do not demonstrate your acceptance and do
not install or use the Program.
You should have received a copy of the license along
with this file. If not, see
<http://resources.spinalcom.com/licenses.pdf>.
-->


<template>
  <nav>
    <div class="navPickerApp">
      <div class="navPickerApp-container">
        <div class="navPickerApp-mainMenu">
          <button class="navPickerApp-mainMenu-button"
                  :class="{
              actived: navBarMainMenuShow,
            }"
                  @click="clickMainMenu()">
            <span></span>
            <span></span>
            <span></span>
          </button>
          <div class="navPickerApp-mainMenu-content"
               :class="{
              actived: navBarMainMenuShow,
            }">
            <div class="navPickerApp-mainMenu-content-profil">
              <div class="navPickerApp-mainMenu-content-profil-name">
                {{userInfo && userInfo.name}}
              </div>
              <div class="navPickerApp-mainMenu-content-profil-role">
                {{userInfo && userInfo.email}}
              </div>
            </div>
            <div class="navPickerApp-mainMenu-content-buttonContainer">
              <button v-for="btn in mainbuttons"
                      :key="btn.name"
                      class="navPickerApp-mainMenu-content-buttonContainer-button"
                      :tabindex="mainMenuTabIndexComputed"
                      @click="btn.action">
                <div
                     class="navPickerApp-mainMenu-content-buttonContainer-button-icon">
                </div>
                <div
                     class="navPickerApp-mainMenu-content-buttonContainer-button-title">
                  {{ btn.name }}</div>
              </button>
            </div>
          </div>
        </div>

        <div class="navPickerApp-companyLogo">
          <img :src="logoSvg" />
        </div>
        <div class="navPickerApp-appMenu">
          <button class="navPickerApp-appMenu-button"
                  @click="clickAppMenu()"
                  :class="{
              actived: navBarAppMenuShow,
            }">
            <div class="buttonLabel">application</div>
            <div class="navPickerApp-appMenu-iconContainer">
              <span class="material-icons">
                {{appSelected.icon || 'location_city'}} </span>
            </div>
            <div class="navPickerApp-appMenu-title">{{appSelected.name}}</div>
          </button>

          <div class="navPickerApp-appMenu-content"
               :class="{
              actived: navBarAppMenuShow,
            }">
            <button v-for="app in apps"
                    :key="app.name"
                    class="navPickerApp-appMenu-content-app"
                    :tabindex="appMenuTabIndexComputed"
                    @click="app.action">
              <div class="navPickerApp-appMenu-content-app-iconContainer">
                <span class="material-icons"> {{app.icon || 'location_city'}}
                </span>
              </div>
              <div class="navPickerApp-appMenu-content-app-title">{{ app.name }}
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  </nav>
</template>


<script>
import { mapActions, mapState } from "vuex";
import logoSvg from "../assets/logo.svg";

export default {
  // props: {
  //   apps: {},
  //   user: {},
  // },
  mounted() {
    this.setApps();
  },
  data() {
    this.homeApp = {
      path: "Home",
      name: "toutes les applications",
      action: () => {},
    };
    return {
      logoSvg,
      appSelected: this.homeApp,
      navBarMainMenuShow: false,
      navBarAppMenuShow: false,
      apps: [this.homeApp],
      mainbuttons: [
        { name: "Paramètres", action: () => console.log("click Paramètres") },
        { name: "Déconnexion", action: () => this.logOut() },
      ],
    };
  },
  methods: {
    ...mapActions("logingStore", ["clearLocalStorage"]),

    clickMainMenu() {
      this.navBarMainMenuShow = !this.navBarMainMenuShow;
      this.navBarAppMenuShow = false;
    },

    clickAppMenu() {
      this.navBarMainMenuShow = false;
      this.navBarAppMenuShow = !this.navBarAppMenuShow;
    },

    logOut() {
      this.clearLocalStorage();
      this.$router.push({ name: "Login" });
    },

    setApps() {
      this.apps = [this.homeApp, ...this.appsDisplayed].map(
        ({ id, name, path, icon, action }) => {
          const app = {
            path: path || name || id,
            name,
            id,
            icon,
          };

          app.action = action
            ? action
            : () => {
                this.appSelected = app;
                // this.goTo(app.path);
              };
          return app;
        }
      );
    },
  },
  computed: {
    ...mapState("userDataStore", ["appsDisplayed", "userInfo"]),
    mainMenuTabIndexComputed() {
      return this.navBarMainMenuShow ? "" : "-1";
    },

    appMenuTabIndexComputed() {
      return this.navBarAppMenuShow ? "" : "-1";
    },

    goTo(path) {
      this.$router.push({ name: path });
    },
  },
  watch: {
    appsDisplayed() {
      this.setApps();
    },
  },
};
</script>

