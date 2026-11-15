*** Comments ***
会員登録画面のカスタムチェックボックス（opacity:0）を操作するサンプル。
  参考: https://qiita.com/emurin/items/bfc985c35f215f4a48d2
  実行: robot samples/register_checkbox.robot
        ローカルで試す場合: robot --variable BASE:http://localhost:8080/ samples/register_checkbox.robot

*** Settings ***
Library    SeleniumLibrary
Suite Setup    Open Browser    ${BASE}register.html    headlesschrome
Suite Teardown    Close Browser

*** Variables ***
${BASE}    https://valtes-rd.github.io/tdash-eva-202702/

*** Test Cases ***
通常のクリックではチェックできない
    Element Should Not Be Visible    id:r-agree
    Run Keyword And Expect Error    *intercepted*    Click Element    id:r-agree
    Checkbox Should Not Be Selected    id:r-agree

ActionChains でクリックするとチェックできる
    Click Element    id:r-agree    action_chain=True
    Checkbox Should Be Selected    id:r-agree

興味のあるジャンル・メルマガも同じ方法で操作できる
    Click Element    id:r-interest-concert    action_chain=True
    Checkbox Should Be Selected    id:r-interest-concert
    Click Element    id:r-newsletter    action_chain=True
    Checkbox Should Not Be Selected    id:r-newsletter
