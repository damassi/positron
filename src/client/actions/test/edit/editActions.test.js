import {
  changeView,
  redirectToList,
  toggleSpinner,
  setYoastKeyword,
} from "client/actions/edit/editActions"
import $ from "jquery"

describe("editActions", () => {
  beforeEach(() => {
    window.location.assign = jest.fn()
  })

  document.body.innerHTML = `
    <div id="edit-sections-spinner" />
  `

  // TODO: ARTICLE LOCKOUT ACTIONS

  it("#changeView sets the activeView to arg", () => {
    const action = changeView("display")

    expect(action.type).toBe("CHANGE_VIEW")
    expect(action.payload.activeView).toBe("display")
  })

  it("#setYoastKeyword sets the yoast keyword", () => {
    const action = setYoastKeyword("photography")

    expect(action.type).toBe("SET_YOAST_KEYWORD")
    expect(action.payload.yoastKeyword).toBe("photography")
  })

  it("#redirectToList forwards to the articles list with published arg", () => {
    redirectToList(true)
    expect(window.location.assign.mock.calls[0][0]).toBe(
      "/articles?published=true"
    )

    redirectToList(false)
    expect(window.location.assign.mock.calls[1][0]).toBe(
      "/articles?published=false"
    )
  })

  it("#toggleSpinner shows/hides the loading spinner based on arg", () => {
    toggleSpinner(false)
    expect($("#edit-sections-spinner").css("display")).toBe("none")

    toggleSpinner(true)
    expect($("#edit-sections-spinner").css("display")).toBe("block")
  })
})
