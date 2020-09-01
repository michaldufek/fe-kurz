<template>
  <nav class="navbar navbar-expand-lg navbar-absolute"
       :class="{'bg-white': showMenu, 'navbar-transparent': !showMenu}">
    <div class="container-fluid">
      <div class="navbar-wrapper">
        <div class="navbar-toggle d-inline" :class="{toggled: $sidebar.showSidebar}">
          <button type="button"
                  class="navbar-toggler"
                  aria-label="Navbar toggle button"
                  @click="toggleSidebar">
            <span class="navbar-toggler-bar bar1"></span>
            <span class="navbar-toggler-bar bar2"></span>
            <span class="navbar-toggler-bar bar3"></span>
          </button>
        </div>
        
        <div>
          <router-link class="navbar-brand" to="/" exact><img src="../../assets/img/logo2020_small.png" class="logo navbar-brand" :alt="$t('siteTitle')"/></router-link>   
          <i v-if="reserved" class="tim-icons icon-button-pause" style="margin-right: 10px"><small>{{' by ' + reserved}}</small></i>      
          <router-link class="navbar-brand" to="/dashboard" style="margin-top: 10px">{{$t("dashboard.title")}}</router-link>
          <router-link class="navbar-brand" to="/research">{{$t("research.title")}}</router-link>
        </div>
      </div>
      <button class="navbar-toggler" type="button"
              @click="toggleMenu"
              data-toggle="collapse"
              data-target="#navigation"
              aria-controls="navigation-index"
              aria-label="Toggle navigation">
        <span class="navbar-toggler-bar navbar-kebab"></span>
        <span class="navbar-toggler-bar navbar-kebab"></span>
        <span class="navbar-toggler-bar navbar-kebab"></span>
      </button>

      <collapse-transition>
        <div class="collapse navbar-collapse show" v-show="showMenu">
          <ul class="navbar-nav" :class="$rtl.isRTL ? 'mr-auto' : 'ml-auto'">
            <div class="search-bar input-group" @click="searchModalVisible = true">
              <!-- <input type="text" class="form-control" placeholder="Search...">
              <div class="input-group-addon"><i class="tim-icons icon-zoom-split"></i></div> -->              
              <button class="btn btn-link" id="search-button" data-toggle="modal" data-target="#searchModal">
                <i class="tim-icons icon-zoom-split"></i>
              </button>
              <!-- You can choose types of search input -->
            </div>
            <modal :show.sync="searchModalVisible"
                   class="modal-search"
                   id="searchModal"
                   :centered="false"
                   :show-close="true">
              <input slot="header" v-model="searchQuery" type="text" class="form-control" id="inlineFormInputGroup" placeholder="SEARCH">
            </modal>
            <base-dropdown tag="li" menu-classes="dropdown-black"
                           :menu-on-right="!$rtl.isRTL"
                           title-tag="a" class="nav-item">
              <a slot="title" href="#" class="dropdown-toggle nav-link" data-toggle="dropdown" aria-expanded="true">
                <div class="notification d-none d-lg-block d-xl-block"></div>
                <i class="tim-icons icon-sound-wave"></i>
                <p class="d-lg-none">
                  {{$t('userMenu.notifications')}}
                </p>
              </a>
              <ul style="list-style-type: none;">
                <li v-for="notification in $notifications.notifications" class="nav-link">
                  <a href="#" class="nav-item dropdown-item">{{ notification }}</a>
                </li>
              </ul>
            </base-dropdown>
            <base-dropdown tag="li" menu-classes="dropdown-black"
                           :menu-on-right="!$rtl.isRTL"
                           title-tag="a"
                           class="nav-item">
              <a slot="title" href="#" class="dropdown-toggle nav-link" data-toggle="dropdown" aria-expanded="true">
                <div class="photo">
                  <img src="/img/default-avatar.png">
                </div>
                <b class="caret d-none d-lg-block d-xl-block"></b>
                <p class="d-lg-none">
                  {{$t('userMenu.actions')}}
                </p>
              </a>
              <li class="nav-link">
                <router-link to="/profile" class="nav-item dropdown-item">{{$t('userMenu.profile')}}</router-link>
              </li>
              <li class="nav-link">
                <router-link to="/ibConnection" class="nav-item dropdown-item">{{$t('userMenu.ibConnection')}}</router-link>
              </li>
              <li class="nav-link">
                <router-link to="/settings" class="nav-item dropdown-item">{{$t('userMenu.settings')}}</router-link>
              </li>
              <div class="dropdown-divider"></div>
              <li class="nav-link">
                <router-link to="/logout" class="nav-item dropdown-item">{{$t('userMenu.logout')}}</router-link>
              </li>
            </base-dropdown>
          </ul>
        </div>
      </collapse-transition>
    </div>
  </nav>
</template>
<script>
  import { CollapseTransition } from 'vue2-transitions';
  import Modal from '@/components/Modal';
  import constants from '@/custom/assets/js/constants'

  export default {
    components: {
      CollapseTransition,
      Modal
    },
    computed: {
      routeName() {
        const { name } = this.$route;
        return this.capitalizeFirstLetter(name);
      },
      isRTL() {
        return this.$rtl.isRTL;
      }
    },
    data() {
      return {
        activeNotifications: false,
        showMenu: false,
        searchModalVisible: false,
        searchQuery: '',

        reserved: ''
      };
    },
    methods: {
      initReserved() {
        this.$http
        .get(constants.urls.reserved)
        .then(response => this.reserved = response.data)
        .catch(error => console.log(error))
        .finally(() => {});
      },

      capitalizeFirstLetter(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
      },
      toggleNotificationDropDown() {
        this.activeNotifications = !this.activeNotifications;
      },
      closeDropDown() {
        this.activeNotifications = false;
      },
      toggleSidebar() {
        this.$sidebar.displaySidebar(!this.$sidebar.showSidebar);
      },
      hideSidebar() {
        this.$sidebar.displaySidebar(false);
      },
      toggleMenu() {
        this.showMenu = !this.showMenu;
      }
    },

    mounted() {
      this.initReserved()      
    }
  };
</script>
<style>
</style>
