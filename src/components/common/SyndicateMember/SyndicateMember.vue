<template>
  <div class="syndicate-member">
    <div class="syndicate-member__row">
      <div class="syndicate-member__row-item">
        <img-getter class="syndicate-member__img" :file-key="info.image.key" />
      </div>
      <div class="syndicate-member__row-item">
        <div class="syndicate-member__details-wrp">
          <p class="syndicate-member__name">
            {{info.name}}
          </p>
          <social-links :links="info.social" />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ImgGetter } from '@comcom/getters'
import SocialLinks from '@comcom/SocialLinks'
export default {
  components: {
    ImgGetter,
    SocialLinks
  },
  props: ['info']
}
</script>

<style scoped>
.syndicate-member__row {
  display: flex;
}

.syndicate-member__img {
  width: 16rem;
  height: 16rem;
  object-fit: cover;
  border-radius: 50%;
}

.syndicate-member__name {
  font-size: 2rem;
  margin-bottom: 1.4rem;
}

.syndicate-member__details-wrp {
  margin-left: 4rem;
}
</style>
