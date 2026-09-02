'use strict';
/**
 * index.js — Public API của Qimen Interpretation Engine.
 */
const { interpretQimen, resolveQuestionType, detectQuestionType, explainInterpretation } = require('./lib/interpret.js');
const scoreLib = require('./lib/score.js');
const { normalizeChart } = require('./lib/chartNormalizer.js');
const { relationsForChart } = require('./lib/qimenRelations.js');
const { resolveYongShen } = require('./lib/yongShenResolver.js');
const { runRuleEngine } = require('./lib/ruleEngine.js');
const { synthesize } = require('./lib/interpretationSynthesizer.js');
const { buildAdvice } = require('./lib/adviceEngine.js');
const qtypes = require('./knowledge/question-types.js');
const rules = require('./knowledge/rules.js');
const patterns = require('./knowledge/patterns.js');
const knowledge = {
    palaces: require('./knowledge/palaces.js'),
    doors: require('./knowledge/doors.js'),
    stars: require('./knowledge/stars.js'),
    deities: require('./knowledge/deities.js'),
    stems: require('./knowledge/stems.js'),
    fiveElements: require('./knowledge/five-elements.js'),
    questionTypes: qtypes,
    yongshen: require('./knowledge/yongshen.js'),
    patterns: patterns,
    rules: rules
};

module.exports = {
    interpretQimen,
    resolveQuestionType,
    detectQuestionType,
    explainInterpretation,
    scoreDirection: scoreLib.directionScore,
    scoreHour: scoreLib.scoreHour,
    topicScores: scoreLib.topicScores,
    componentScores: scoreLib.componentScores,
    topicScoreFromVerdict: scoreLib.topicScoreFromVerdict,
    dimensionVerdicts: scoreLib.dimensionVerdicts,
    TOPIC_CELLS: scoreLib.TOPIC_CELLS,
    normalizeChart,
    relationsForChart,
    resolveYongShen,
    runRuleEngine,
    synthesize,
    buildAdvice,
    QUESTION_TYPES: qtypes.QUESTION_TYPES,
    RULES: rules.RULES,
    knowledge: knowledge,
    VERSION: '1.0.0'
};
