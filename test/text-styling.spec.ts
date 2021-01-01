import 'should'

import { indentStyleText } from '../src/indentStyleText'
import { styleText, TextStyle } from '../src/styleText'
import { ThemeItem, ThemeStyles } from '../src/theme'
import { run } from './exec'

describe('Text styling', () => {
  const runColored = (
    fileName: string,
    name?: string,
    theme?: Partial<ThemeStyles>,
    throws = false
  ) => run(fileName, { colorsEnabled: true, theme, '--name': name }, throws)

  it('fails with unknown styles', () => {
    const theme: Partial<ThemeStyles> = {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      [ThemeItem.FeatureKeyword]: ['ultraviolet'],
    }
    try {
      runColored('step.feature', 'Step name', theme, true)
      throw new Error('Should have failed')
    } catch (error) {
      error.stderr
        .toString()
        .should.containEql('Error: Unknown style "ultraviolet"')
    }
  })

  it('fails with unknown theme items', () => {
    const theme: Partial<ThemeStyles> = {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      ['unknown theme item']: ['red'],
    }
    try {
      runColored('step.feature', 'Step name', theme, true)
      throw new Error('Should have failed')
    } catch (error) {
      error.stderr
        .toString()
        .should.containEql('Error: Unknown theme item "unknown theme item"')
    }
  })

  describe('customizable items', () => {
    it('styles feature keywords', () => {
      runColored('feature.feature', 'Feature name', {
        [ThemeItem.FeatureKeyword]: ['red', 'italic'],
      }).should.containEql(styleText('Feature:', 'red', 'italic'))
    })

    it('styles feature descriptions', () => {
      runColored('description.feature', undefined, {
        [ThemeItem.FeatureDescription]: ['bgGreen'],
      }).should.containEql(
        indentStyleText(2, '**I like**\nTo describe\nMy _features_', [
          'bgGreen',
        ])
      )
    })

    it('styles rule keywords', () => {
      runColored('rule.feature', undefined, {
        [ThemeItem.RuleKeyword]: ['yellow'],
      }).should.containEql(`  ${styleText('Rule:', 'yellow')} first rule\n`)
    })

    it('styles scenario keywords', () => {
      runColored('scenario.feature', 'Scenario name', {
        [ThemeItem.ScenarioKeyword]: ['bgYellow'],
      }).should.containEql(
        `${styleText('Scenario:', 'bgYellow')} Scenario name\n`
      )
    })

    it('styles step keywords', () => {
      const stepStyles: TextStyle[] = ['bgYellow', 'bold']
      runColored('step.feature', 'Step name', {
        [ThemeItem.StepKeyword]: stepStyles,
      }).should.containEql(
        `    ${styleText('Given', ...stepStyles)} noop\n` +
          `    ${styleText('When', ...stepStyles)} noop\n` +
          `    ${styleText('Then', ...stepStyles)} noop\n`
      )
    })
  })

  describe('non-customizable items (colored by Cucumber)', () => {
    it('styles ambiguous steps', () => {
      runColored('step.feature', 'Ambiguous step').should.containEql(
        `    ${styleText('✖ ambiguous', 'red')}\n`
      )
    })

    it('styles failed steps', () => {
      runColored('step.feature', 'Failed step').should.containEql(
        `    ${styleText('✖ failed', 'red')}\n`
      )
    })

    it('styles pending steps', () => {
      runColored('step.feature', 'Pending step').should.containEql(
        `    ${styleText('? pending', 'yellow')}\n`
      )
    })

    it('styles undefined steps', () => {
      runColored('step.feature', 'Undefined step').should.containEql(
        `    ${styleText('? undefined', 'yellow')}\n`
      )
    })

    it('styles skipped steps', () => {
      runColored('step.feature', 'Skipped step').should.containEql(
        `    ${styleText('- skipped', 'cyan')}\n`
      )
    })

    it('styles errors', () => {
      runColored('step.feature', 'Failed step').should.containEql(
        `    ${styleText('Error: FAILED', 'red')}`
      )
    })

    it('styles feature tags', () => {
      runColored('tag.feature', 'Feature tag').should.containEql(
        `${styleText('@feature @tag', 'cyan')}\n`
      )
    })

    it('styles scenario tags', () => {
      runColored('tag.feature', 'Scenario tag').should.containEql(
        `${styleText('@feature @tag @scenario', 'cyan')}\n`
      )
    })
  })

  describe('default theme', () => {
    let runResult: string
    before(() => (runResult = runColored('step.feature', 'Step name')))

    it('styles feature keywords', () =>
      runResult.should.containEql(styleText('Feature:', 'blue', 'bold')))

    it('styles scenario keywords', () =>
      runResult.should.containEql(styleText('Scenario:', 'cyan')))

    it('styles descriptions', () =>
      runResult.should.containEql(styleText('Description', 'gray')))

    it('styles step keywords', () => {
      runResult.should.containEql(styleText('Given', 'cyan', 'bold'))
      runResult.should.containEql(styleText('When', 'cyan', 'bold'))
      runResult.should.containEql(styleText('Then', 'cyan', 'bold'))
    })
  })
})