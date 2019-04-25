<template>
  <div class="corporate-member">
    <div class="corporate-member__row">
      <div class="corporate-member__row-item">
        <img-getter class="corporate-member__img" :file-key="info.image.key" />
      </div>
      <div class="corporate-member__row-item">
        <div class="corporate-member__details-wrp">
          <p class="corporate-member__name">
            {{ info.name }}
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
    SocialLinks,
  },

  props: {
    info: { type: Object, required: true },
  },
}
</script>

<style scoped>
.corporate-member__row {
  display: flex;
}

.corporate-member__img {
  width: 16rem;
  height: 16rem;
  object-fit: cover;
  border-radius: 50%;
}

.corporate-member__name {
  font-size: 2rem;
  margin-bottom: 1.4rem;
}

.corporate-member__details-wrp {
  margin-left: 4rem;
}
</style>
