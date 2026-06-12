<script setup lang="ts">
import CaseFlowView from '../../case-engine/components/CaseFlowView.vue';
import { jiangMaskCase } from '../../data/shortCases/jiangMask';
import JiangMaskCaseArea from './jiangMask/JiangMaskCaseArea.vue';
import JiangMaskSurveyArea from './jiangMask/JiangMaskSurveyArea.vue';
import JiangMaskStoryArea from './jiangMask/JiangMaskStoryArea.vue';

const areaComponents = {
  case: JiangMaskCaseArea,
  survey: JiangMaskSurveyArea,
  story: JiangMaskStoryArea,
};
</script>

<template>
  <CaseFlowView
    :playable-case="jiangMaskCase"
    base-path="/short/jiang-mask"
    :area-components="areaComponents"
  />
</template>
