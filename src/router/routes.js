// LayoutViews
import LandingLayout from "@/custom/layout/landing/LandingLayout.vue";
import DashboardLayout from "@/custom/layout/application/DashboardLayout.vue";
import ResearchLayout from "@/custom/layout/application/ResearchLayout.vue";
import PatternLabLayout from "@/custom/layout/application/patternLab/Layout.vue";
import OptimizationLayout from "@/custom/layout/application/optimization/Layout.vue";
import SettingsLayout from "@/custom/layout/application/SettingsLayout.vue";

// GeneralViews
import NotFound from "@/pages/NotFoundPage.vue";
const About = () => import(/* webpackChunkName: "about" */"@/custom/apps/About.vue");
const Login = () => import(/* webpackChunkName: "login" */"@/custom/apps/Login.vue");

// SubViews
const Dashboard = () => import(/* webpackChunkName: "dashboard" */"@/custom/apps/dashboard/Dashboard.vue");
const Details = () => import(/* webpackChunkName: "details" */"@/custom/apps/dashboard/Details.vue");
const PortfolioManager = () => import(/* webpackChunkName: "portfolioManager" */"@/custom/apps/research/PortfolioManager.vue");
const StockPickingLab = () => import(/* webpackChunkName: "stockPickingLab" */"@/custom/apps/research/StockPickingLab.vue");
// const RelativeValuesLab = () => import(/* webpackChunkName: "relativeValuesLab" */"@/custom/apps/research/RelativeValuesLab.vue");
const FSEngineering = () => import(/* webpackChunkName: "fsengineering" */"@/custom/apps/research/FSEngineering.vue");
const WareHouse = () => import(/* webpackChunkName: "wareHouse" */"@/custom/apps/research/WareHouse.vue");
// menu SubViews
const Profile = () => import(/* webpackChunkName: "profile" */"@/pages/Profile.vue");
const IBConnection = () => import(/* webpackChunkName: "ibConnection" */"@/custom/apps/IBConnection.vue");
const Settings = () => import(/* webpackChunkName: "settings" */"@/custom/apps/Settings.vue");
// PatternLab SubViews
const PatternLabChart = () => import(/* webpackChunkName: "patternLabchart" */"@/custom/apps/research/patternLab/Chart.vue");
const PatternStatistics = () => import(/* webpackChunkName: "patternStatistics" */"@/custom/apps/research/patternLab/PatternStatistics.vue");
const BacktestPatterns = () => import(/* webpackChunkName: "backtestPatterns" */"@/custom/apps/research/patternLab/BacktestPatterns.vue");
const Alerts = () => import(/* webpackChunkName: "patternLabAlerts" */"@/custom/apps/research/patternLab/Alerts.vue"); // app doesn't work with webpackChunkName: "alerts" !
// Optimization SubViews
const OptimizationParameterSweep = () => import(/* webpackChunkName: "optimizationParameterSweep" */"@/custom/apps/research/optimization/ParameterSweep.vue");
const OptimizationGenetics = () => import(/* webpackChunkName: "optimizationGenetics" */"@/custom/apps/research/optimization/Genetics.vue");
// BacktestPatterns SubViews
const Patterns = () => import(/* webpackChunkName: "patterns" */"@/custom/apps/research/patternLab/performanceResults/Patterns.vue");
const Trades = () => import(/* webpackChunkName: "trades" */"@/custom/apps/research/patternLab/performanceResults/Trades.vue");
const PerformanceMetrics = () => import(/* webpackChunkName: "performanceMetrics" */"@/custom/apps/research/patternLab/performanceResults/PerformanceMetrics.vue");
const PerformanceResultsChart = () => import(/* webpackChunkName: "performanceResultsChart" */"@/custom/apps/research/patternLab/performanceResults/Chart.vue");


import auth from '@/custom/assets/js/auth'


function requireAuth (to, from, next) {
  if (!auth.loggedIn()) {
    next({
      path: '/landing',
      query: { redirect: to.fullPath }
    })
  } else {
    next()
  }
}

const routes = [
  // landing pages
  {
    path: "/landing",
    component: LandingLayout,
    redirect: "/login",
    children: [
      {
        path: "/login",
        component: Login
      },
      { 
        path: '/about', 
        name: 'about',
        component: About 
      },
      { 
        path: '/logout',
        name: "logout",
        component: Login
      },
      // password reset & registration verification pages
      {
        path: "/fe/verify-register/:key",
        component: Login
      },
      {
        path: "/fe/verify-reset/:uid/:token",
        component: Login
      }      
    ]
  },
  // logged in pages
  {
    path: "/",
    component: DashboardLayout,
    redirect: "/dashboard",
    children: [
      {
        path: "/dashboard",
        name: "dashboard",
        component: Dashboard
      },
      {
        path: "/dashboard/details",
        name: "details",
        component: Details
      }
    ],
    beforeEnter: requireAuth
  },
  {
    path: "/research",
    component: ResearchLayout,
    redirect: "/research/portfolioManager",
    children: [   
      {
        path: "/research/portfolioManager",
        name: "portfolioManager",
        component: PortfolioManager
      },   
      {
        path: "/research/stockPickingLab",
        name: "stockPickingLab",
        component: StockPickingLab
      },
      {
        path: "/research/patternLab",
        name: "patternLab",
        component: PatternLabLayout,
        redirect: "/research/patternLab/chart",
        children: [   
          {
            path: "/research/patternLab/chart",
            name: "patternLabChart",
            component: PatternLabChart
          },   
          {
            path: "/research/patternLab/patternStatistics",
            name: "patternStatistics",
            component: PatternStatistics
          },
          {
            path: "/research/patternLab/backtestPatterns",
            name: "backtestPatterns",
            redirect: "/research/patternLab/backtestPatterns/performanceResults/patterns",
            component: BacktestPatterns,
            children: [
              {
                path: "/research/patternLab/backtestPatterns/performanceResults/patterns",
                name: "patterns",
                component: Patterns,
                props: true
              },
              {
                path: "/research/patternLab/backtestPatterns/performanceResults/trades",
                name: "trades",
                component: Trades
              },
              {
                path: "/research/patternLab/backtestPatterns/performanceResults/performanceMetrics",
                name: "performanceMetrics",
                component: PerformanceMetrics
              },
              {
                path: "/research/patternLab/backtestPatterns/performanceResults/chart",
                name: "performanceResultsChart",
                component: PerformanceResultsChart
              }
            ]
          },
          {
            path: "/research/patternLab/alerts",
            name: "alerts",
            component: Alerts
          }  
        ],
      },
      {
        path: "/research/optimization",
        name: "optimization",
        component: OptimizationLayout,
        redirect: "/research/optimization/parameterSweep",
        children: [
          {
            path: "/research/optimization/parameterSweep",
            name: "optimizationParameterSweep",
            component: OptimizationParameterSweep
          },
          {
            path: "/research/optimization/genetics",
            name: "optimizationGenetics",
            component: OptimizationGenetics
          }
        ]
      },
      // {
      //   path: "/research/relativeValuesLab",
      //   name: "relativeValuesLab",
      //   component: RelativeValuesLab
      // },
      {
        path: "/research/fsengineering",
        name: "fsengineering",
        component: FSEngineering
      }, 
      {
        path: "/research/wareHouse",
        name: "wareHouse",
        component: WareHouse
      }  
    ],
    beforeEnter: requireAuth
  },
  // user menu pages
  {
    path: "/profile",
    component: SettingsLayout,
    redirect: "/profile",
    children: [
      {
        path: "/profile",
        name: "profile",
        component: Profile        
      },
      {
        path: "/ibConnection",
        name: "ibConnection",
        component: IBConnection        
      },   
      {
        path: "/settings",
        name: "settings",
        component: Settings
      }      
    ],
    beforeEnter: requireAuth
  },    
  // all other pages
  { path: "*", component: NotFound },
];

/**
 * Asynchronously load view (Webpack Lazy loading compatible)
 * The specified component must be inside the Views folder
 * @param  {string} name  the filename (basename) of the view to load.
function view(name) {
   var res= require('../components/Dashboard/Views/' + name + '.vue');
   return res;
};**/

export default routes;