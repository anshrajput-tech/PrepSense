import React, { useState, useEffect, useRef } from "react";
import { FaMicrophone, FaMicrophoneSlash } from "react-icons/fa";
import { BsArrowRight } from "react-icons/bs";
import maleVideo from "../assets/videos/male-ai.mp4";
import femaleVideo from "../assets/videos/female-ai.mp4";
import { motion } from "motion/react";
import Timer from "./Timer";
import axios from "axios";
import { ServerUrl } from "../App";
function Step2Interview({ interviewData, onFinish }) {
  const { interviewId, userName } = interviewData;
  const durationSeconds = interviewData.durationSeconds || 600;

  const [isIntroPhase, setIsIntroPhase] = useState(true);
  const [questions, setQuestions] = useState(interviewData.questions);

  const [isMicOn, setIsMicOn] = useState(true);
  const recognitionRef = useRef(null);
  const isSubmittingRef = useRef(false);
  const isFinishingRef = useRef(false);
  const finishAfterSubmissionRef = useRef(false);
  const finishInterviewRef = useRef(null);
  const timeLeftRef = useRef(durationSeconds);
  const [isAIPlaying, setIsAIPlaying] = useState(false);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState("");
  const [timeLeft, setTimeLeft] = useState(durationSeconds);
  const [selectedVoice, setSelectedVoice] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGeneratingQuestion, setIsGeneratingQuestion] = useState(false);
  const [questionError, setQuestionError] = useState("");
  const [voiceGender, setVoiceGender] = useState("female");
  const [subtitle, setSubtitle] = useState("");

  const videoRef = useRef(null);

  const currentQuestion = questions[currentIndex];

  useEffect(() => {
    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      if (!voices.length) return;

      // Try known female voices first
      const femaleVoice = voices.find(
        (v) =>
          v.name.toLowerCase().includes("zira") ||
          v.name.toLowerCase().includes("samantha") ||
          v.name.toLowerCase().includes("female"),
      );

      if (femaleVoice) {
        setSelectedVoice(femaleVoice);
        setVoiceGender("female");
        return;
      }

      // Try known male voices
      const maleVoice = voices.find(
        (v) =>
          v.name.toLowerCase().includes("david") ||
          v.name.toLowerCase().includes("mark") ||
          v.name.toLowerCase().includes("male"),
      );

      if (maleVoice) {
        setSelectedVoice(maleVoice);
        setVoiceGender("male");
        return;
      }

      // Fallback: first voice (assume female)
      setSelectedVoice(voices[0]);
      setVoiceGender("female");
    };

    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
  }, []);

  const videoSource = voiceGender === "male" ? maleVideo : femaleVideo;

  /* ---------------- SPEAK FUNCTION ---------------- */
  const speakText = (text) => {
    return new Promise((resolve) => {
      if (!window.speechSynthesis || !selectedVoice) {
        resolve();
        return;
      }

      window.speechSynthesis.cancel();

      // Add natural pauses after commas and periods
      const humanText = text.replace(/,/g, ", ... ").replace(/\./g, ". ... ");

      const utterance = new SpeechSynthesisUtterance(humanText);

      utterance.voice = selectedVoice;

      // Human-like pacing
      utterance.rate = 0.92; // slightly slower than normal
      utterance.pitch = 1.05; // small warmth
      utterance.volume = 1;

      utterance.onstart = () => {
        setIsAIPlaying(true);
        stopMic();
        videoRef.current?.play();
      };

      utterance.onend = () => {
        videoRef.current?.pause();
        videoRef.current.currentTime = 0;
        setIsAIPlaying(false);

        if (isMicOn && !isFinishingRef.current) {
          startMic();
        }
        setTimeout(() => {
          setSubtitle("");
          resolve();
        }, 300);
      };

      setSubtitle(text);

      window.speechSynthesis.speak(utterance);
    });
  };

  useEffect(() => {
    if (!selectedVoice) {
      return;
    }
    const runIntro = async () => {
      if (isIntroPhase) {
        await speakText(
          `Hi ${userName}, it's great to meet you today. I hope you're feeling confident and ready.`,
        );

        await speakText(
          "I'll ask you a few questions. Just answer naturally, and take your time. Let's begin.",
        );

        setIsIntroPhase(false);
      } else if (currentQuestion) {
        await new Promise((r) => setTimeout(r, 800));

        await speakText(currentQuestion.question);

        if (isMicOn && !isFinishingRef.current && timeLeftRef.current > 0) {
          startMic();
        }
      }
    };

    runIntro();
  }, [selectedVoice, isIntroPhase, currentIndex]);

  useEffect(() => {
    if (!("webkitSpeechRecognition" in window)) return;

    const recognition = new window.webkitSpeechRecognition();
    recognition.lang = "en-US";
    recognition.continuous = true;
    recognition.interimResults = false;

    recognition.onresult = (event) => {
      const transcript = event.results[event.results.length - 1][0].transcript;

      setAnswer((prev) => prev + " " + transcript);
    };

    recognitionRef.current = recognition;
  }, []);

  const startMic = () => {
    if (recognitionRef.current && !isAIPlaying) {
      try {
        recognitionRef.current.start();
      } catch (error) {
        if (error.name !== "InvalidStateError") throw error;
      }
    }
  };

  const stopMic = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (error) {
        if (error.name !== "InvalidStateError") throw error;
      }
    }
  };

  const toggleMic = () => {
    if (isMicOn) {
      stopMic();
    } else {
      startMic();
    }
    setIsMicOn(!isMicOn);
  };

  const submitAnswer = async () => {
    if (isSubmittingRef.current || isFinishingRef.current) return;
    stopMic();
    isSubmittingRef.current = true;
    setIsSubmitting(true);

    try {
      const result = await axios.post(
        ServerUrl + "/api/interview/submit-answer",
        {
          interviewId,
          questionIndex: currentIndex,
          answer,
        },
        { withCredentials: true },
      );

      setFeedback(result.data.feedback);
      speakText(result.data.feedback);
    } catch (error) {
      console.log(error);
    } finally {
      isSubmittingRef.current = false;
      setIsSubmitting(false);
      if (finishAfterSubmissionRef.current) {
        finishAfterSubmissionRef.current = false;
        finishInterviewRef.current?.();
      }
    }
  };

  const handleNext = async () => {
    if (timeLeftRef.current === 0 || isFinishingRef.current) return;
    setQuestionError("");
    setIsGeneratingQuestion(true);
    try {
      await speakText("Alright, let's move to the next question.");

      if (currentIndex + 1 < questions.length) {
        setAnswer("");
        setFeedback("");
        setCurrentIndex(currentIndex + 1);
        return;
      }

      if (timeLeftRef.current === 0 || isFinishingRef.current) return;

      const result = await axios.post(
        ServerUrl + "/api/interview/generate-next-question",
        { interviewId },
        { withCredentials: true },
      );

      if (isFinishingRef.current || timeLeftRef.current === 0) return;
      const nextQuestions = [...questions, result.data.question];
      setAnswer("");
      setFeedback("");
      setQuestions(nextQuestions);
      setCurrentIndex(nextQuestions.length - 1);
    } catch (error) {
      console.log(error);
      setQuestionError("Could not load the next question. Please try again.");
    } finally {
      setIsGeneratingQuestion(false);
    }
  };

  const finishInterview = async () => {
    if (isFinishingRef.current) return;
    isFinishingRef.current = true;
    stopMic();
    setIsMicOn(false);
    window.speechSynthesis.cancel();
    try {
      const result = await axios.post(
        ServerUrl + "/api/interview/finish",
        { interviewId },
        { withCredentials: true },
      );

      console.log(result.data);
      onFinish(result.data);
    } catch (error) {
      console.log(error);
      isFinishingRef.current = false;
    }
  };

  finishInterviewRef.current = finishInterview;

  useEffect(() => {
    if (isIntroPhase) return undefined;

    const deadline = Date.now() + durationSeconds * 1000;
    const updateTimeLeft = () => {
      const remaining = Math.max(0, Math.ceil((deadline - Date.now()) / 1000));
      timeLeftRef.current = remaining;
      setTimeLeft(remaining);

      if (remaining === 0) {
        clearInterval(timer);
        if (isSubmittingRef.current) {
          finishAfterSubmissionRef.current = true;
        } else {
          finishInterviewRef.current?.();
        }
      }
    };

    const timer = setInterval(updateTimeLeft, 1000);
    updateTimeLeft();
    return () => clearInterval(timer);
  }, [durationSeconds, isIntroPhase]);

  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
        recognitionRef.current.abort();
      }

      window.speechSynthesis.cancel();
    };
  }, []);

  return (
    <div className="min-h-screen bg-linear-to-br from-rose-50 via-white to-teal-100 flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-350 min-h-[80vh] bg-white rounded-3xl shadow-2xl border border-gray-200 flex flex-col lg:flex-row overflow-hidden">
        {/* video section */}
        <div className="w-full lg:w-[35%] bg-white flex flex-col items-center p-6 space-y-6 border-r border-gray-200">
          <div className="w-full max-w-md rounded-2xl overflow-hidden shadow-xl">
            <video
              src={videoSource}
              key={videoSource}
              ref={videoRef}
              muted
              playsInline
              preload="auto"
              className="w-full h-auto object-cover"
            />
          </div>

          {/* subtitle */}
          {subtitle && (
            <div className="w-full max-w-md bg-gray-50 border border-gray-200 rounded-xl p-4 shadow-sm">
              <p className="text-gray-700 text-sm sm:text-base font-medium text-center leading-relaxed">
                {subtitle}
              </p>
            </div>
          )}

          {/* timer Area */}
          <div className="w-full max-w-md bg-white border border-gray-200 rounded-2xl shadow-md p-6 space-y-5">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">Interview Status</span>
              {isAIPlaying && (
                <span className="text-sm font-semibold text-rose-600">
                  {isAIPlaying ? "AI Speaking" : ""}
                </span>
              )}
            </div>

            <div className="h-px bg-gray-200" />

            <div className="flex justify-center">
              <Timer
                timeLeft={timeLeft}
                totalTime={durationSeconds}
              />
            </div>

            <div className="h-px bg-gray-200" />

            <div className="grid grid-cols-2 gap-6 text-center">
              <div>
                <span className="text-2xl font-bold text-rose-600">
                  {currentIndex + 1}
                </span>
                <span className="text-xs text-gray-400">Question number</span>
              </div>

              <div>
                <span className="text-2xl font-bold text-rose-600">
                  {questions.length}
                </span>
                <span className="text-xs text-gray-400">Questions so far</span>
              </div>
            </div>
          </div>
        </div>

        {/* Text section */}

        <div className="flex-1 flex flex-col p-4 sm:p-6 md:p-8 relative">
          <h2 className="text-xl sm:text-2xl font-bold text-rose-600 mb-6">
            AI Smart Interview
          </h2>

          {!isIntroPhase && (
            <div className="relative mb-6 bg-gray-50 p-4 sm:p-6 rounded-2xl border border-gray-200 shadow-sm">
              <p className="text-xs sm:text-sm text-gray-400 mb-2">
                Question {currentIndex + 1}
              </p>

              <div className="text-base sm:text-lg font-semibold text-gray-800 leading-relaxed ">
                {currentQuestion?.question}
              </div>
            </div>
          )}
          <textarea
            placeholder="Type your answer here..."
            onChange={(e) => setAnswer(e.target.value)}
            value={answer}
            className="flex-1 bg-gray-100 p-4 sm:p-6 rounded-2xl resize-none outline-none border border-gray-200 focus:ring-2 focus:ring-rose-500 transition text-gray-800"
          />

          {!feedback ? (
            <div className="flex items-center gap-4 mt-6">
              <motion.button
                onClick={toggleMic}
                whileTap={{ scale: 0.9 }}
                className="w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center rounded-full bg-black text-white shadow-lg"
              >
                {isMicOn ? (
                  <FaMicrophone size={20} />
                ) : (
                  <FaMicrophoneSlash size={20} />
                )}
              </motion.button>

              <motion.button
                onClick={submitAnswer}
                disabled={isSubmitting}
                whileTap={{ scale: 0.95 }}
                className="flex-1 bg-linear-to-r from-rose-600 to-teal-500 text-white py-3 sm:py-4 rounded-2xl shadow-lg hover:opacity-90 transition font-semibold disabled:bg-gray-500"
              >
                {isSubmitting ? "Submitting..." : "Submit Answer"}
              </motion.button>
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-6 bg-rose-50 border border-rose-200 p-5 rounded-2xl shadow-sm"
            >
              <p className="text-rose-700 font-medium mb-4">{feedback}</p>
              {questionError && (
                <p className="mb-4 text-sm text-red-700">{questionError}</p>
              )}

              <button
                onClick={handleNext}
                disabled={isGeneratingQuestion || timeLeft === 0}
                className="w-full bg-linear-to-r from-rose-600 to-teal-500 text-white py-3 rounded-xl shadow-md hover:opacity-90 transition flex items-center justify-center gap-1"
              >
                {isGeneratingQuestion ? "Preparing next question..." : "Next Question"}
                {!isGeneratingQuestion && <BsArrowRight size={18} />}
              </button>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Step2Interview;
