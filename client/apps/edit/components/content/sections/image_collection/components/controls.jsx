import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { clone } from 'lodash'
import { data as sd } from 'sharify'
import { Row, Col } from 'react-styled-flexboxgrid'
import Artwork from '/client/models/artwork.coffee'
import { Autocomplete } from '/client/components/autocomplete2/index'
import FileInput from '/client/components/file_input/index.jsx'
import SectionControls from '../../../section_controls/index.jsx'
import { InputArtworkUrl } from './input_artwork_url.jsx'

export class ImageCollectionControls extends Component {
  static propTypes = {
    articleLayout: PropTypes.string.isRequired,
    channel: PropTypes.object.isRequired,
    images: PropTypes.array.isRequired,
    isHero: PropTypes.bool,
    section: PropTypes.object.isRequired,
    setProgress: PropTypes.func,
    onChange: PropTypes.func.isRequired
  }

  filterAutocomplete = (items) => {
    return items._embedded.results.map((item) => {
      const { type } = item

      if (type === 'artwork') {
        const { title, _links } = item
        const { thumbnail, self } = _links
        const _id = self.href.substr(self.href.lastIndexOf('/') + 1)
        const thumbnail_image = thumbnail && thumbnail.href

        return {
          _id,
          title,
          thumbnail_image,
          type
        }
      } else {
        return false
      }
    })
  }

  fetchDenormalizedArtwork = async (id) => {
    try {
      const artwork = await new Artwork({ id }).fetch()
      return new Artwork(artwork).denormalized()
    } catch (err) {
      // TODO: REDUX ERROR
      // const message = 'Artwork not found.'
      // this.props.actions.logError({
      //   error: { message }
      // })
      return err
    }
  }

  onNewImage = (image) => {
    const { images, section } = this.props
    const newImages = clone(images).concat(image)

    section.set('images', newImages)
  }

  onUpload = (image, width, height) => {
    this.onNewImage({
      url: image,
      type: 'image',
      width: width,
      height: height,
      caption: ''
    })
  }

  inputsAreDisabled = () => {
    const { section } = this.props
    return section.get('layout') === 'fillwidth' && section.get('images').length > 0
  }

  fillwidthAlert = () => {
    // TODO: REDUX ERROR
    // const message = 'Fullscreen layouts accept one asset, please remove extra images.'
    // this.props.actions.logError({
    //   error: { message }
    // })
    debugger
  }

  render () {
    const {
      articleLayout,
      channel,
      isHero,
      section,
      setProgress,
      onChange
    } = this.props

    const inputsAreDisabled = this.inputsAreDisabled()

    return (
        <SectionControls
          section={section}
          channel={channel}
          articleLayout={articleLayout}
          onChange={onChange}
          sectionLayouts={!isHero}
          isHero={isHero}
          disabledAlert={this.fillwidthAlert}
        >
          <div onClick={inputsAreDisabled ? this.fillwidthAlert : undefined}>
            <FileInput
              disabled={inputsAreDisabled}
              onProgress={setProgress}
              onUpload={this.onUpload}
              video={section.get('layout') === 'fillwidth'}
            />
          </div>

          { !isHero &&
            <Row
              className='edit-controls__artwork-inputs'
              onClick={inputsAreDisabled ? this.fillwidthAlert : undefined}
            >
              <Col xs={6}>
                <Autocomplete
                  className='edit-controls__autocomplete-input'
                  disabled={inputsAreDisabled}
                  filter={this.filterAutocomplete}
                  items={section.get('images')}
                  onSelect={(images) => section.set('images', images)}
                  placeholder='Search artworks by title...'
                  resObject={(item) => this.fetchDenormalizedArtwork(item._id)}
                  url={`${sd.ARTSY_URL}/api/search?q=%QUERY`}
                />
              </Col>
              <Col xs={6}>
                <InputArtworkUrl
                  className='edit-controls__byurl-input'
                  addArtwork={this.onNewImage}
                  fetchArtwork={this.fetchDenormalizedArtwork}
                />
              </Col>
            </Row>
          }

        { section.get('type') === 'image_set' &&
          <Row className='edit-controls__image-set-inputs'>
            <Col xs={6}>
              <input
                ref='title'
                className='bordered-input bordered-input-dark'
                defaultValue={section.get('title')}
                onChange={(e) => section.set('title', e.target.value)}
                placeholder='Image Set Title (optional)'
              />
            </Col>
            <Col xs={6} className='inputs'>
              <label>Entry Point:</label>
              <div className='layout-inputs'>
                <div className='input-group'>
                  <div
                    className='radio-input'
                    onClick={() => section.set('layout', 'mini')}
                    data-active={section.get('layout') !== 'full'}
                  />
                  Mini
                </div>
                <div className='input-group'>
                  <div
                    className='radio-input'
                    onClick={() => section.set('layout', 'full')}
                    data-active={section.get('layout') === 'full'}
                  />
                  Full
                </div>
              </div>
            </Col>
          </Row>
        }
      </SectionControls>
    )
  }
}
