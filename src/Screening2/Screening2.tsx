import './Screening2.css'
import React, { useState } from 'react'
import { ProgressBar } from './ProgressBar'


interface castQuestions {
    question: string;
    options: string[];
}

export const Screening2: React.FC = () => {
    const [scores, setScores] = useState<{ [key: number]: number }>({});
    const [showForm, setShowForm] = useState(true);
    const [showScore, setShowScore] = useState(false);
    const [disclaimer, setDisclaimer] = useState(true);
    const [fillAmount, setFillAmount] = useState(0);
    
    const castQuestions: castQuestions[] = [
        {question: "Does s/he join in playing games with other children easily?", options: ["Yes", "No"]},
        {question: "Does s/he come up to you spontaneously for a chat?", options: ["Yes", "No"]},
        {question: "Was s/he speaking by 2 years old?", options: ["Yes", "No"]},
        {question: "Does s/he enjoy sports?", options: ["Yes", "No"]},
        {question: "Is it important to him/her to fit in with the peer group?", options: ["Yes", "No"]},
        {question: "Does s/he appear to notice unusual details that others miss?", options: ["Yes", "No"]},
        {question: "Does s/he tend to take things literally?", options: ["Yes", "No"]},
        {question: "When s/he was 3 years old, did s/he spend a lot of time pretending (e.g., play-acting being a superhero, or holding teddy's tea parties)?", options: ["Yes", "No"]},
        {question: "Does s/he like to do things over and over again, in the same way all the time?", options: ["Yes", "No"]},
        {question: "Does s/he find it easy to interact with other children?", options: ["Yes", "No"]},
        {question: "Can s/he keep a two-way conversation going?", options: ["Yes", "No"]},
        {question: "Can s/he read appropriately for his/her age?", options: ["Yes", "No"]},
        {question: "Does s/he mostly have the same interests as his/her peers?", options: ["Yes", "No"]},
        {question: "Does s/he have an interest which takes up so much time that s/he does little else?", options: ["Yes", "No"]},
        {question: "Does s/he have friends, rather than just acquaintances?", options: ["Yes", "No"]},
        {question:"Does s/he often bring you things s/he is interested in to show you?", options: ["Yes", "No"]},
        {question: "Does s/he enjoy joking around?", options: ["Yes", "No"]},
        {question: "Does s/he have difficulty understanding the rules for polite behavior?", options: ["Yes", "No"]},
        {question: "Does s/he appear to have an unusual memory for details?", options: ["Yes", "No"]},
        {question: "Is his/her voice unusual (e.g., overly adult, flat, or very monotonous)?", options: ["Yes", "No"]},
        {question: "Are people important to him/her?", options: ["Yes", "No"]},
        {question: "Can s/he dress him/herself?", options: ["Yes", "No"]},
        {question: "Is s/he good at turn-taking in conversation?", options: ["Yes", "No"]},
        {question: "Does s/he play imaginatively with other children, and engage in role-play?", options: ["Yes", "No"]},
        {question: "Does s/he often do or say things that are tactless or socially inappropriate?", options: ["Yes", "No"]},
        {question: "Can s/he count to 50 without leaving out any numbers?", options: ["Yes", "No"]},
        {question: "Does s/he make normal eye-contact?", options: ["Yes", "No"]},
        {question: "Does s/he have any unusual and repetitive movements?", options: ["Yes", "No"]},
        {question: "Is his/her social behavior very one-sided and always on his/her own terms?", options: ["Yes", "No"]},
        {question: "Does s/he sometimes say “you” or “s/he” when s/he means “I”?", options: ["Yes", "No"]},
        {question: "Does s/he prefer imaginative activities such as play-acting or story-telling, rather than numbers or lists of facts?", options: ["Yes", "No"]},
        {question: "Does s/he sometimes lose the listener because of not explaining what s/he is talking about?", options: ["Yes", "No"]},
        {question: "Can s/he ride a bicycle (even if with stabilizers)?", options: ["Yes", "No"]},
        {question: "Does s/he try to impose routines on him/herself, or on others, in such a way that it causes problems?", options: ["Yes", "No"]},
        {question: "Does s/he care how s/he is perceived by the rest of the group?", options: ["Yes", "No"]},
        {question: "Does s/he often turn conversations to his/her favorite subject rather than following what the other person wants to talk about?", options: ["Yes", "No"]},
        {question: "Does s/he have odd or unusual phrases?", options: ["Yes", "No"]},
        {question: "Have teachers/health visitors ever expressed any concerns about his/her development?", options: ["Yes", "No"]},
        {question: "Has s/he ever been diagnosed with any of the following: Language delay, ADHD, hearing or visual difficulties, Autism Spectrum Condition (including Asperger’s Syndrome, or a physical disability?", options: ["Yes", "No"]}
    ]


    const handleChange = (index: number, value: string) => {
        let scoreChange = 0;

  const specialRules = [1, 5, 7, 9, 12, 14, 18, 19, 20, 22, 26, 28, 30, 32, 34, 36];
  if (specialRules.includes(index)) {
    scoreChange = value === '1' ? 1 : 0; 
  }

  const generalRules = [3, 4, 6, 8, 10, 11, 13, 15, 16, 17, 21, 23, 24, 25, 27, 29, 31, 33, 35];
  if (generalRules.includes(index)) {
    scoreChange = value === '0' ? 1 : 0; 
  }

  const newScore = {...scores};
  newScore[index] = scoreChange ? 1 : 0;;
  setScores(newScore);

  const fillAmountPercentage = (Object.keys(newScore).length / 39) * 100;

  setFillAmount(fillAmountPercentage);
      };
    
      const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault();
        setShowScore(true); 
        setShowForm(false);
        setDisclaimer(false);
      };
    
      const totalScore = () => {
        return Object.values(scores).reduce((acc, curr) => acc + curr, 0);
      };
    
      return (
        <div className='castWrapper'>
          <div className='castTextContainer'>
            <h1 className='castText'>Childhood Autism Spectrum Test (CAST)</h1>
            {disclaimer && (
                <div className='paragraphContainer'>
                <p className='castParagraph'>This test is for children 4 and older. It is a simple test that can help you determine if your child may have autism. Please keep in mind that this test is not a substitute for an official diagnosis. Please seek a certified healthcare professional for an official diagnosis. 
                </p>
                <p className='castQuestionMessage'>
                    This test consists of 39 questions. Please answer each question to the best of your ability.
                </p>
                </div>
            )}
          </div>
          <div className='castTestContainer'>
            {showForm &&(
                <form className='castForm' onSubmit={handleSubmit}>
                <div className='progressBar'>
            <ProgressBar bgcolor="#597497" fillAmount={fillAmount}  height="20px" />
            </div>
            {castQuestions.map((question, index) => (
              <div key={index} className='castQuestion'>
                <h3 className='castQuestionNumber'>{index + 1}.</h3>
                <label className='castLabel'>{question.question}</label>
                {question.options.map((option, optIndex) => (
                  <span key={optIndex} className='castOption'>
                    <input
                      type="radio"
                      id={`option-${index}-${optIndex}`}
                      name={`question-${index}`}
                      value={optIndex === 0 ? '1' : '0'}
                      onChange={() => handleChange(index, optIndex === 0 ? '1' : '0')}
                      required
                    />
                    <label htmlFor={`option-${index}-${optIndex}`}>{option}</label>
                  </span>
                ))}
              </div>
            ))}
            <button type="submit" className='castSubmit'>Submit</button>
          </form>
            )}
            {showScore && (
              <div className='scoreWrapper'>
                <div className='scoreContainer'>
                <h1>Total Score: {totalScore()}</h1>
                <p className='low'>Low risk: 0-14.</p>
                <p className='medium'>Medium risk: 15-31.</p>
                <p className='high'>High risk: 32-39.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      );
    };

