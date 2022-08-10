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
  <v-card class="cardContainer"
          @click="goToApplication">
    <div class="content">
      <div class="left">
        <v-card class="iconDiv">
          <v-icon color="#000000">{{ data.icon}}</v-icon>
        </v-card>
      </div>

      <div class="right">
        <div class="name"
             :title="data.name">
          {{data.name}}
        </div>

        <div class="description"
             :title="data.description">
          {{data.description}}
        </div>

        <div class="tags"
             :title="getTagsTitle">
          <v-chip class="chip"
                  label
                  color="#6699cc"
                  v-for="(tag,index) in data.tags"
                  :key="index"
                  small>
            <v-icon left
                    color="#ffffff">
              mdi-circle-small
            </v-icon>{{tag.toUpperCase()}}
          </v-chip>
        </div>

        <div class="actions">
          <div>
            <v-btn class="favorisBtn"
                   title="add to favorite"
                   outlined
                   small
                   color="#bdbdbd"
                   @click.stop="addAppToFavoris">
              <v-icon>mdi-cards-diamond</v-icon>
            </v-btn>
            <v-btn icon
                   @click.stop="show = !show">
              <v-icon>{{ show ? 'mdi-chevron-up' : 'mdi-chevron-down' }}
              </v-icon>
            </v-btn>
          </div>
        </div>

        <!-- <div class="favoris">
          <v-btn color="primary lighten-2"
                 text>
            Explore
          </v-btn>

          <v-btn class="favorisBtn"
                 title="add to favorite"
                 outlined
                 small
                 color="#bdbdbd">
            <v-icon>mdi-cards-diamond</v-icon>
          </v-btn>
        </div> -->
      </div>

    </div>
    <v-expand-transition>
      <div v-show="show">
        <v-divider></v-divider>

        <v-card-text>
          I'm a thing. But, like most politicians, he promised more than he
          could deliver. You won't have time for sleeping, soldier, not with
          all
          the bed making you'll be doing. Then we'll go with that data file!
          Hey, you add a one and two zeros to that or we walk! You're going to
          do his laundry? I've got to find a way to escape.
        </v-card-text>
      </div>
    </v-expand-transition>

    <!-- <v-card-actions>
      <v-btn color="primary lighten-2"
             text
             @click="exploreApp">
        Explore
      </v-btn>
      <v-spacer></v-spacer>
      <div>
        <v-btn class="favorisBtn"
               title="add to favorite"
               outlined
               small
               color="#bdbdbd"
               @click="addAppToFavoris">
          <v-icon>mdi-cards-diamond</v-icon>
        </v-btn>
        <v-btn icon
               @click="show = !show">
          <v-icon>{{ show ? 'mdi-chevron-up' : 'mdi-chevron-down' }}</v-icon>
        </v-btn>
      </div>

    </v-card-actions> -->

  </v-card>
</template>

<script>
export default {
  name: "applicationCard",
  props: {
    data: {},
  },
  data() {
    return {
      show: false,
    };
  },
  methods: {
    goToApplication() {
      this.$emit("goToApp", this.data);
    },

    exploreApp() {
      this.$emit("exploreApp", this.data);
    },
    addAppToFavoris() {
      this.$emit("addAppToFavoris", this.data);
    },
  },
  computed: {
    getTagsTitle() {
      return this.data.tags.join(", ");
    },
  },
};
</script>

<style scoped>
.cardContainer {
  width: 100%;
  min-height: 113px;
  background: #ffffff;
  margin: 10px 0;
  border-radius: 7px;
  display: flex;
  flex-direction: column;
}

.cardContainer:hover {
  cursor: pointer;
}

.cardContainer .content {
  width: 100%;
  height: 100%;
  display: flex;
}

.cardContainer .content .left {
  width: 40px;
  /* height: 100%; */
  background: #f7f8f8;
  /* background: red; */
  display: flex;
  justify-content: center;
}

.cardContainer .content .left .iconDiv {
  height: 30px;
  display: flex;
  justify-content: center;
  align-items: center;
  /* background: #ffffff; */
  padding: 5px;
  margin-top: 5px;
}

.cardContainer .content .right {
  width: calc(100% - 40px);
  height: 100%;
  padding: 5px;
}

.cardContainer .content .right .name,
.cardContainer .content .description,
.cardContainer .content .tags,
.cardContainer .content .actions {
  width: 100%;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  vertical-align: middle;
  /* margin-bottom: 5px; */
}

.cardContainer .content .right .name {
  height: 30px;
  font-size: 0.9em;
  color: #000000;
  text-transform: uppercase;
  font-weight: 900;
  display: flex;
  align-items: center;
}

.cardContainer .content .description {
  height: 20px;
  font-size: 0.7em;
  display: flex;
  align-items: center;
}

.cardContainer .content .tags {
  height: 25px;
}

.cardContainer .content .tags .chip {
  height: 16px;
  color: #ffffff;
  font-size: 0.7em;
  margin-right: 4px;
  /* font-weight: bold; */
}

.cardContainer .content .actions {
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: flex-end;
}

/* .cardContainer .content .favoris {
  display: flex;
  justify-content: space-between;
} */

.cardContainer .content .actions .favorisBtn {
  min-width: unset !important;
  width: 25px;
  height: 25px !important;
  border-radius: 5px;
}
</style>

<style>
.cardContainer .content .actions .favorisBtn i {
  font-size: 10px;
}

.cardContainer .content .tags .chip i {
  min-width: none !important;
  width: 5px;
}
</style>